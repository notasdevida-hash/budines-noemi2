
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * PARTE 2: ENDPOINT PARA CREAR EL PAGO (El "Cajero")
 * Recibe los productos y genera el link de pago de Mercado Pago.
 */

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(req: Request) {
  try {
    const { items, customerInfo, userId } = await req.json();

    // 1. Creamos un ID único para este pedido en Firestore
    const orderRef = adminDb.collection('orders').doc();
    const orderId = orderRef.id;

    const total = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

    // 2. Guardamos el pedido en Firestore como "pending"
    const orderData = {
      id: orderId,
      userId: userId || 'guest',
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email || '',
      items: items,
      total: total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await orderRef.set(orderData);

    // 3. Creamos la preferencia en Mercado Pago
    const preference = new Preference(client);
    
    const body = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.name,
        unit_price: Number(item.price),
        quantity: Number(item.quantity),
        currency_id: 'ARS', // Cambia según tu país
      })),
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      },
      auto_return: 'approved',
      external_reference: orderId, // Vinculamos el ID de Firestore con MP
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook-mercadopago`,
    };

    const response = await preference.create({ body });

    // 4. Devolvemos el link para que el cliente vaya a pagar
    return NextResponse.json({ 
      id: orderId,
      init_point: response.init_point 
    });

  } catch (error: any) {
    console.error('Error en crear-pago:', error);
    return NextResponse.json({ error: 'No se pudo crear el pago' }, { status: 500 });
  }
}
