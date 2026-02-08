
import { NextResponse } from 'next/server';
import { getAdminServices } from '@/lib/firebase-admin';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export const dynamic = 'force-dynamic';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(req: Request) {
  try {
    const { adminDb } = getAdminServices();
    const { items, customerInfo, userId } = await req.json();

    // Limpiar la URL del sitio para evitar dobles barras //
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
    
    if (!siteUrl) {
      console.error('❌ Error: NEXT_PUBLIC_SITE_URL no está configurada');
      return NextResponse.json({ error: 'Configuración del servidor incompleta' }, { status: 500 });
    }

    const orderRef = adminDb.collection('orders').doc();
    const orderId = orderRef.id;

    const total = items.reduce((acc: number, item: any) => acc + (Number(item.price) * Number(item.quantity)), 0);

    const orderData = {
      id: orderId,
      userId: userId || 'invitado',
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email || '',
      items: items.map((i: any) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price),
        quantity: Number(i.quantity)
      })),
      total: total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await orderRef.set(orderData);

    const preference = new Preference(client);
    
    const body = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.name,
        unit_price: Number(item.price),
        quantity: Number(item.quantity),
        currency_id: 'ARS',
      })),
      back_urls: {
        success: `${siteUrl}/`,
        failure: `${siteUrl}/checkout`,
        pending: `${siteUrl}/`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      // Mercado Pago requiere que esta URL sea HTTPS y pública
      notification_url: `${siteUrl}/api/webhook/mercadopago`,
    };

    console.log(`📦 Creando preferencia para orden: ${orderId}`);
    console.log(`🔗 Webhook URL: ${body.notification_url}`);

    const response = await preference.create({ body });

    return NextResponse.json({ 
      id: orderId,
      init_point: response.init_point 
    });

  } catch (error: any) {
    console.error('❌ Error en Checkout:', error);
    return NextResponse.json({ error: 'No se pudo crear el pago. Revisa las variables de entorno.' }, { status: 500 });
  }
}
