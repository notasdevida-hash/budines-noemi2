
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
 * Webhook para Mercado Pago.
 * Procesa la notificación de pago, actualiza el estado de la orden,
 * descuenta el stock y envía el recibo por email generado por IA.
 */
export async function POST(req: Request) {
  try {
    const { adminDb } = getAdminServices();
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const dataId = url.searchParams.get('data.id');

    // Solo procesamos eventos de tipo 'payment'
    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ status: 'ignorado' });
    }

    console.log(`🔔 Webhook recibido: Pago ID ${dataId}`);

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: dataId });

    const orderId = paymentData.external_reference;
    const status = paymentData.status;

    if (!orderId) {
      console.warn('⚠️ Webhook sin external_reference (orderId)');
      return NextResponse.json({ error: 'Sin ID de orden' }, { status: 400 });
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      console.error(`❌ Orden ${orderId} no encontrada en Firestore`);
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const order = orderSnap.data();
    const oldStatus = order?.status;

    let nuevoEstado = 'pending';
    if (status === 'approved') nuevoEstado = 'paid';
    if (status === 'rejected' || status === 'cancelled') nuevoEstado = 'failed';

    // Si el pago es aprobado y no estaba marcado como pagado previamente
    if (nuevoEstado === 'paid' && oldStatus !== 'paid') {
      const batch = adminDb.batch();
      
      // 1. Actualizar estado de la orden
      batch.update(orderRef, {
        status: 'paid',
        mp_id: dataId,
        updatedAt: new Date().toISOString(),
      });

      // 2. Descontar stock de los productos
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
      console.log(`✅ Orden ${orderId} marcada como pagada y stock actualizado.`);

      // 3. Generar y Enviar recibo por Email usando IA y Resend
      if (order?.customerEmail && process.env.RESEND_API_KEY) {
        try {
          const receipt = await generateReceiptContent({
            customerName: order.customerName,
            orderId: orderId,
            items: order.items,
            total: order.total,
          });

          console.log(`📧 Enviando recibo a ${order.customerEmail}...`);

          const emailResponse = await fetch('https://api.resend.com/emails', {
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

          if (emailResponse.ok) {
            console.log(`✅ Recibo enviado con éxito a ${order.customerEmail}`);
          } else {
            const errorData = await emailResponse.json();
            console.error('❌ Error al enviar email via Resend:', errorData);
          }
        } catch (aiError) {
          console.error('❌ Error en el flujo de envío de recibo:', aiError);
        }
      } else {
        console.warn('⚠️ No se envió recibo: falta email del cliente o RESEND_API_KEY');
      }
    } else if (nuevoEstado !== oldStatus) {
      // Si el estado cambió a algo que no sea 'paid' (ej: fallido)
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
