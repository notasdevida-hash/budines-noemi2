
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * @fileoverview Endpoint para crear una preferencia de pago en Mercado Pago.
 * 1. Crea la orden en Firestore con estado 'pending'.
 * 2. Genera el link de pago (init_point).
 */

// Configuramos el cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
});

export async function POST(req: Request) {
  try {
    const { items, customerInfo, userId } = await req.json();

    // 1. Crear la referencia de la orden en Firestore primero
    const orderRef = adminDb.collection('orders').doc();
    const orderId = orderRef.id;

    const total = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

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
      external_reference: orderId, // Crucial para el Webhook
    };

    await orderRef.set(orderData);

    // 2. Crear la preferencia en Mercado Pago
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
      external_reference: orderId, // Vinculamos MP con nuestra DB
      notification_url: `${process.env.MP_WEBHOOK_URL}/api/webhook/mercadopago`,
    };

    const response = await preference.create({ body });

    return NextResponse.json({ 
      id: orderId,
      init_point: response.init_point 
    });

  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
