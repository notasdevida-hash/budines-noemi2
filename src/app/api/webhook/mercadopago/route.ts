
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(req: Request) {
  try {
    const { adminDb } = getAdminServices();
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const dataId = url.searchParams.get('data.id');

    // Solo procesamos avisos de pagos
    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ status: 'ignorado' });
    }

    // 1. Consultar estado real del pago a Mercado Pago
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: dataId });

    const orderId = paymentData.external_reference;
    const status = paymentData.status;

    if (!orderId) {
      console.log('⚠️ Notificación sin external_reference (ID de orden).');
      return NextResponse.json({ error: 'Sin ID de orden' }, { status: 400 });
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      console.log(`⚠️ Orden ${orderId} no encontrada en Firestore.`);
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const order = orderSnap.data();
    const oldStatus = order?.status;

    let nuevoEstado = 'pending';
    if (status === 'approved') nuevoEstado = 'paid';
    if (status === 'rejected' || status === 'cancelled') nuevoEstado = 'failed';

    // 2. Si el pago es aprobado y el pedido NO estaba pagado aún, descontamos stock
    if (nuevoEstado === 'paid' && oldStatus !== 'paid') {
      const batch = adminDb.batch();
      
      // Actualizar el estado del pedido
      batch.update(orderRef, {
        status: 'paid',
        mp_id: dataId,
        updatedAt: new Date().toISOString(),
      });

      // Descontar stock de cada producto de forma atómica
      if (order?.items) {
        order.items.forEach((item: any) => {
          const productRef = adminDb.collection('products').doc(item.id);
          // Usamos FieldValue.increment con valor negativo para restar
          batch.update(productRef, {
            stock: admin.firestore.FieldValue.increment(-Number(item.quantity))
          });
        });
      }

      await batch.commit();
      console.log(`✅ Pedido ${orderId} pagado con éxito. Stock descontado.`);
    } else {
      // Si no es aprobado o ya estaba pagado, solo actualizamos el estado si cambió
      if (nuevoEstado !== oldStatus) {
        await orderRef.update({
          status: nuevoEstado,
          mp_id: dataId,
          updatedAt: new Date().toISOString(),
        });
        console.log(`ℹ️ Pedido ${orderId} actualizado a estado: ${nuevoEstado}`);
      }
    }

    return NextResponse.json({ recibido: true });

  } catch (error: any) {
    console.error('❌ Error en Webhook:', error);
    // Retornamos 200 aunque haya error para que Mercado Pago deje de reintentar si es un error de lógica
    return NextResponse.json({ error: 'Error procesando la notificación' }, { status: 200 });
  }
}
