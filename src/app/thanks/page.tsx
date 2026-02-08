
"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, MessageCircle, ShoppingBag, Home } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/components/cart-provider';

function ThanksContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const db = useFirestore();
  const { clearCart } = useCart();
  const router = useRouter();

  const orderRef = useMemoFirebase(() => {
    if (!db || !orderId) return null;
    return doc(db, 'orders', orderId);
  }, [db, orderId]);

  const { data: order, isLoading } = useDoc(orderRef);

  useEffect(() => {
    if (order?.status === 'paid' || order?.status === 'pending') {
      clearCart();
    }
  }, [order, clearCart]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Confirmando tu pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">No encontramos los detalles de tu orden.</h2>
        <Button asChild><Link href="/">Volver al inicio</Link></Button>
      </div>
    );
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola Noemi! 👋 Acabo de realizar una compra.\n\n` +
      `📌 *Orden:* #${order.id.slice(-6)}\n` +
      `👤 *Cliente:* ${order.customerName}\n` +
      `💰 *Total:* $${order.total}\n\n` +
      `Me gustaría coordinar la entrega. ¡Gracias!`
    );
    window.open(`https://wa.me/5491112345678?text=${text}`, '_blank'); // Cambia el número por el tuyo
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 mt-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">¡Gracias por tu compra!</h1>
          <p className="text-lg text-muted-foreground">Tu pedido ha sido recibido y estamos listos para empezar a hornear.</p>
        </div>

        <Card className="border-2 border-primary/20 shadow-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b py-6">
            <CardTitle className="text-center text-xl font-black uppercase tracking-tight">Detalle de tu Recibo</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-muted-foreground font-bold uppercase tracking-tighter">Orden ID:</div>
              <div className="text-right font-mono text-xs">{order.id}</div>
              <div className="text-muted-foreground font-bold uppercase tracking-tighter">Estado:</div>
              <div className="text-right"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">Confirmado</span></div>
            </div>

            <div className="space-y-3 pt-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm font-medium">
                  <span>{item.name} (x{item.quantity})</span>
                  <span className="font-bold">${item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-dashed pt-4 flex justify-between items-center">
              <span className="text-xl font-black uppercase tracking-tighter">Total Pagado</span>
              <span className="text-3xl font-black text-primary">${order.total}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button onClick={handleWhatsApp} className="flex-1 py-8 text-lg font-black rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white shadow-xl hover:scale-[1.02] transition-transform">
            <MessageCircle className="mr-2 h-6 w-6" /> RECIBIR POR WHATSAPP
          </Button>
          <Button variant="outline" asChild className="flex-1 py-8 text-lg font-black rounded-2xl shadow-md border-2">
            <Link href="/"><Home className="mr-2 h-5 w-5" /> VOLVER AL INICIO</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ThanksPage() {
  return (
    <Suspense fallback={<div className="p-24 text-center">Cargando...</div>}>
      <ThanksContent />
    </Suspense>
  );
}
