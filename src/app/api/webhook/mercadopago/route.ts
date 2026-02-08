
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import * as admin from 'firebase-admin';
import { generateReceiptContent } from '@/ai/flows/send-receipt-flow';

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

    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ status: 'ignorado' });
    }

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

    if (nuevoEstado === 'paid' && oldStatus !== 'paid') {
      const batch = adminDb.batch();
      
      batch.update(orderRef, {
        status: 'paid',
        mp_id: dataId,
        updatedAt: new Date().toISOString(),
      });

      if (order?.items) {
        order.items.forEach((item: any) => {
          const productRef = adminDb.collection('products').doc(item.id);
          batch.update(productRef, {
            stock: admin.firestore.FieldValue.increment(-Number(item.quantity))
          });
        });
      }

      await batch.commit();

      // Enviar recibo si hay email
      if (order?.customerEmail) {
        try {
          const receipt = await generateReceiptContent({
            customerName: order.customerName,
            orderId: orderId,
            items: order.items,
            total: order.total,
          });
          
          console.log(`📧 Generando recibo para ${order.customerEmail}`);
          console.log(`Asunto: ${receipt.subject}`);
          // Aquí se conectaría con un servicio como Resend/SendGrid usando receipt.body
          // resend.emails.send({ from: 'Noemi <hola@budinesnoemi.com>', to: order.customerEmail, ...receipt });
        } catch (aiError) {
          console.error('Error al generar recibo con AI:', aiError);
        }
      }
    } else {
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
    console.error('❌ Error en Webhook:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 200 });
  }
}
