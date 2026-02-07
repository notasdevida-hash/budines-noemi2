
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic');
    const id = url.searchParams.get('id');

    // Logic:
    // 1. Receive notification from MP
    // 2. Fetch full payment info from MP API using the token (Server Side)
    // 3. Use Firebase Admin to update order status in Firestore (paid/failed)
    
    console.log(`Received MP Webhook: topic=${topic}, id=${id}`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
