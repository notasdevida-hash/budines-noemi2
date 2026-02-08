
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import * as admin from 'firebase-admin';
import { generateReceiptContent, ReceiptOutput } from '@/ai/flows/send-receipt-flow';

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

    console.log(`🔔 Webhook recibido: Pago ID ${dataId}`);

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
          if (item.id) {
            const productRef = adminDb.collection('products').doc(item.id);
            batch.update(productRef, {
              stock: admin.firestore.FieldValue.increment(-Number(item.quantity))
            });
          }
        });
      }

      await batch.commit();
      console.log(`✅ Orden ${orderId} pagada. Iniciando recibo...`);

      if (order?.customerEmail && process.env.RESEND_API_KEY) {
        let receipt: ReceiptOutput;

        try {
          receipt = await generateReceiptContent({
            customerName: order.customerName,
            orderId: orderId,
            items: order.items,
            total: order.total,
          });
        } catch (aiError) {
          console.error('⚠️ Error IA (usando fallback):', aiError);
          receipt = {
            subject: `Confirmación de tu pedido #${orderId.slice(-6)} - Budines Noemi`,
            body: `<div style="font-family: sans-serif; padding: 20px; color: #333;"><h1>¡Gracias, ${order.customerName}!</h1><p>Tu pago ha sido confirmado.</p></div>`
          };
        }

        try {
          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Budines Noemi <onboarding@resend.dev>',
              to: [order.customerEmail],
              subject: receipt.subject,
              html: receipt.body,
            }),
          });

          const resendData = await resendResponse.json();
          
          if (resendResponse.ok) {
            console.log('✅ Email enviado con éxito:', resendData.id);
          } else {
            console.error('❌ Error de Resend (Probablemente restricción de dominio):', resendData);
          }
        } catch (emailError) {
          console.error('❌ Error crítico de conexión con Resend:', emailError);
        }
      }
    } else if (nuevoEstado !== oldStatus) {
      await orderRef.update({
        status: nuevoEstado,
        mp_id: dataId,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ recibido: true });
  } catch (error: any) {
    console.error('❌ Error crítico en Webhook:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 200 });
  }
}
