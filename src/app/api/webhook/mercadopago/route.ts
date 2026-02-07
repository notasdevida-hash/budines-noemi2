
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { MercadoPagoConfig, Payment } from 'mercadopago';

/**
 * API WEBHOOK (El "Notificador")
 * Mercado Pago nos llama aquí para avisarnos si alguien pagó.
 */

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const dataId = url.searchParams.get('data.id');

    // Solo nos interesan los avisos de "pago"
    if (type !== 'payment' || !dataId) {
      return NextResponse.json({ status: 'ignorado' });
    }

    // 1. Le preguntamos a Mercado Pago: "¿Es verdad este pago?"
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: dataId });

    const orderId = paymentData.external_reference; // El ID que anotamos antes
    const status = paymentData.status; // 'approved' significa que pagó

    if (!orderId) return NextResponse.json({ error: 'Sin ID de orden' }, { status: 400 });

    // 2. Buscamos el pedido en nuestro "Libro de Ventas" (Firestore)
    const orderRef = adminDb.collection('orders').doc(orderId);
    
    // 3. Actualizamos el estado según lo que dijo MP
    let nuevoEstado = 'pending';
    if (status === 'approved') nuevoEstado = 'paid';
    if (status === 'rejected' || status === 'cancelled') nuevoEstado = 'failed';

    await orderRef.update({
      status: nuevoEstado,
      mp_id: dataId, // Guardamos el comprobante de MP por las dudas
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ recibido: true });

  } catch (error: any) {
    console.error('Error en Webhook:', error);
    return NextResponse.json({ error: 'Error procesando aviso' }, { status: 500 });
  }
}
