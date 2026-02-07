
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { MercadoPagoConfig, Payment } from 'mercadopago';

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

    if (!orderId) return NextResponse.json({ error: 'Sin ID de orden' }, { status: 400 });

    const orderRef = adminDb.collection('orders').doc(orderId);
    
    let nuevoEstado = 'pending';
    if (status === 'approved') nuevoEstado = 'paid';
    if (status === 'rejected' || status === 'cancelled') nuevoEstado = 'failed';

    await orderRef.update({
      status: nuevoEstado,
      mp_id: dataId,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ recibido: true });

  } catch (error: any) {
    console.error('Error en Webhook:', error);
    return NextResponse.json({ error: 'Error procesando aviso' }, { status: 500 });
  }
}
