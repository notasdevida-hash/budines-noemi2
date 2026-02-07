
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ mensaje: "Usa /api/webhook/mercadopago en su lugar" }, { status: 410 });
}
