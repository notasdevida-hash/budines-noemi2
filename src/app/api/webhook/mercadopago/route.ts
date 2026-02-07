
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
      return NextResponse.json({ error: 'Sin ID de orden' }, { status: 400 });
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
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

      // Descontar stock de cada producto
      if (order?.items) {
        order.items.forEach((item: any) => {
          const productRef = adminDb.collection('products').doc(item.id);
          batch.update(productRef, {
            stock: admin.firestore.FieldValue.increment(-item.quantity)
          });
        });
      }

      await batch.commit();
      console.log(`✅ Pedido ${orderId} pagado y stock actualizado.`);
    } else {
      // Si no es aprobado o ya estaba pagado, solo actualizamos el estado si cambió
      if (nuevoEstado !== oldStatus) {
        await orderRef.update({
          status: nuevoEstado,
          mp_id: dataId,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ recibido: true });

  } catch (error: any) {
    console.error('Error en Webhook:', error);
    return NextResponse.json({ error: 'Error procesando' }, { status: 200 }); // Retornar 200 para evitar reintentos infinitos de MP
  }
}
