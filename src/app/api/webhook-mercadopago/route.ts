
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { MercadoPagoConfig, Payment } from 'mercadopago';

/**
 * PARTE 3: WEBHOOK DE MERCADO PAGO (El "Notificador")
 * Recibe el aviso de Mercado Pago cuando el estado de un pago cambia.
 */

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const dataId = url.searchParams.get('data.id');

    // Solo procesamos notificaciones de tipo 'payment'
    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    // 1. Consultamos el estado real del pago a Mercado Pago (Seguridad)
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: dataId });

    const orderId = paymentData.external_reference; 
    const status = paymentData.status; 

    if (!orderId) {
      return NextResponse.json({ error: 'No external_reference found' }, { status: 400 });
    }

    // 2. Buscamos el pedido en Firestore y actualizamos el estado
    const orderRef = adminDb.collection('orders').doc(orderId);
    
    let nuevoEstado = 'pending';
    if (status === 'approved') nuevoEstado = 'paid';
    if (status === 'rejected' || status === 'cancelled') nuevoEstado = 'failed';

    await orderRef.update({
      status: nuevoEstado,
      mercadopago_payment_id: dataId,
      updatedAt: new Date().toISOString(),
    });

    // 3. Respondemos con 200 OK para que MP no reintente el envío
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Error en Webhook:', error);
    // Respondemos 200 de todos modos para evitar bucles de reintento de MP ante errores internos
    return NextResponse.json({ error: 'Internal Error' }, { status: 200 });
  }
}
