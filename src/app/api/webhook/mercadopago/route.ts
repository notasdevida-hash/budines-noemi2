
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { MercadoPagoConfig, Payment } from 'mercadopago';

/**
 * @fileoverview Webhook para recibir notificaciones de Mercado Pago.
 * Es la fuente de verdad absoluta para el estado de los pagos.
 */

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const dataId = url.searchParams.get('data.id');

    // Mercado Pago envía notificaciones de varios tipos, nos interesa 'payment'
    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ status: 'ignored' });
    }

    // 1. Consultar el pago real a la API de Mercado Pago (Seguridad)
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: dataId });

    const orderId = paymentData.external_reference;
    const status = paymentData.status; // 'approved', 'rejected', etc.

    if (!orderId) {
      return NextResponse.json({ error: 'No external_reference found' }, { status: 400 });
    }

    // 2. Buscar y actualizar la orden en Firestore usando Admin SDK
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Idempotencia: No actualizar si ya está pagada
    const currentOrder = orderSnap.data();
    if (currentOrder?.status === 'paid') {
      return NextResponse.json({ status: 'already_processed' });
    }

    // 3. Mapear estados de MP a nuestra lógica
    let newStatus = 'pending';
    if (status === 'approved') newStatus = 'paid';
    if (status === 'rejected' || status === 'cancelled') newStatus = 'failed';

    await orderRef.update({
      status: newStatus,
      mp_payment_id: dataId,
      updatedAt: new Date().toISOString(),
    });

    console.log(`Order ${orderId} updated to ${newStatus}`);

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
