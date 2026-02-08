
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import * as admin from 'firebase-admin';
import { generateReceiptContent } from '@/ai/flows/send-receipt-flow';

export const dynamic = 'force-dynamic';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

/**
 * WEBHOOK DE MERCADO PAGO
 * Procesa notificaciones de pago y actualiza Firestore.
 * Genera un recibo por IA si el pago es aprobado.
 */
export async function POST(req: Request) {
  try {
    const { adminDb } = getAdminServices();
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const dataId = url.searchParams.get('data.id');

    // Solo nos interesan las notificaciones de pagos
    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ status: 'ignorado' });
    }

    // Consultar el estado real del pago en Mercado Pago (Seguridad)
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

    // ACCIÓN: Si el pago se aprobó y antes no lo estaba
    if (nuevoEstado === 'paid' && oldStatus !== 'paid') {
      const batch = adminDb.batch();
      
      // 1. Actualizar la orden
      batch.update(orderRef, {
        status: 'paid',
        mp_id: dataId,
        updatedAt: new Date().toISOString(),
      });

      // 2. Descontar Stock automáticamente
      if (order?.items) {
        order.items.forEach((item: any) => {
          const productRef = adminDb.collection('products').doc(item.id);
          batch.update(productRef, {
            stock: admin.firestore.FieldValue.increment(-Number(item.quantity))
          });
        });
      }

      await batch.commit();
      console.log(`✅ Orden ${orderId} pagada y stock actualizado.`);

      // 3. GENERAR RECIBO POR IA (Solo si hay email)
      if (order?.customerEmail) {
        try {
          const receipt = await generateReceiptContent({
            customerName: order.customerName,
            orderId: orderId,
            items: order.items,
            total: order.total,
          });
          
          console.log(`📧 RECIBO GENERADO PARA: ${order.customerEmail}`);
          console.log(`Asunto: ${receipt.subject}`);
          // Aquí integrarías con un proveedor de email como Resend
          // await resend.emails.send({ to: order.customerEmail, subject: receipt.subject, html: receipt.body });
        } catch (aiError) {
          console.error('❌ Error al generar recibo con IA:', aiError);
        }
      }
    } else if (nuevoEstado !== oldStatus) {
      // Si el estado cambió pero no a 'paid' (ej: falló)
      await orderRef.update({
        status: nuevoEstado,
        mp_id: dataId,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ recibido: true });

  } catch (error: any) {
    console.error('❌ Error crítico en Webhook:', error);
    // Respondemos 200 para que Mercado Pago no reintente infinitamente si es un error controlado
    return NextResponse.json({ error: 'Error interno' }, { status: 200 });
  }
}
