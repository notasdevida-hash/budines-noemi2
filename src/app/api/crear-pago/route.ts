
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ mensaje: "Usa /api/checkout en su lugar" }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ mensaje: "Usa /api/checkout en su lugar" }, { status: 410 });
}
