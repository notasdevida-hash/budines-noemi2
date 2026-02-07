
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * API DE CHECKOUT (El "Cajero")
 * 1. Anota el pedido en Firestore.
 * 2. Le pide a Mercado Pago un link para que el cliente pague.
 */

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(req: Request) {
  try {
    const { items, customerInfo, userId } = await req.json();

    // 1. Creamos un ID único para este pedido
    const orderRef = adminDb.collection('orders').doc();
    const orderId = orderRef.id;

    const total = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

    // 2. Guardamos el pedido en nuestra base de datos como "pendiente"
    const orderData = {
      id: orderId,
      userId: userId || 'invitado',
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email || '',
      items: items,
      total: total,
      status: 'pending', // Todavía no sabemos si pagó
      createdAt: new Date().toISOString(),
    };

    await orderRef.set(orderData);

    // 3. Le decimos a Mercado Pago qué estamos vendiendo
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
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      },
      auto_return: 'approved',
      external_reference: orderId, // IMPORTANTE: Así MP nos dice después CUÁL pedido se pagó
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/mercadopago`,
    };

    const response = await preference.create({ body });

    // 4. Le devolvemos el link de pago al cliente
    return NextResponse.json({ 
      id: orderId,
      init_point: response.init_point 
    });

  } catch (error: any) {
    console.error('Error en Checkout:', error);
    return NextResponse.json({ error: 'No se pudo crear el pago' }, { status: 500 });
  }
}
