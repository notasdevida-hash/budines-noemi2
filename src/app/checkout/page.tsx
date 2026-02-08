
"use client";

import { useCart } from '@/components/cart-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalPrice, cartCount } = useCart();
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cartCount === 0) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const customerInfo = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: (formData.get('email') as string) || '',
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerInfo,
          userId: user?.uid,
        }),
      });

      const data = await response.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || 'Error al crear el pago');
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo iniciar el pago.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="bg-secondary/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Tu carrito está vacío</h2>
        <p className="text-muted-foreground mb-8">¡Agrega algunos budines deliciosos para continuar!</p>
        <Button asChild size="lg">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a la tienda</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 mt-16 md:mt-24">
      <h1 className="text-3xl md:text-4xl font-black mb-8 md:mb-12 text-center text-primary uppercase tracking-tighter">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
        <div className="order-2 lg:order-1 space-y-8">
          <Card className="border-t-4 border-t-primary shadow-xl rounded-[2rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="h-5 w-5 text-primary" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input id="name" name="name" placeholder="Ej: Noemi Garcia" required className="py-6 rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono de Contacto *</Label>
                  <Input id="phone" name="phone" placeholder="Ej: 11 1234 5678" required className="py-6 rounded-xl" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email (para recibir tu recibo 📧)</Label>
                  <Input id="email" name="email" type="email" placeholder="tu@email.com" className="py-6 rounded-xl" />
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full py-8 text-xl font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95" disabled={loading}>
                    {loading ? "PREPARANDO PAGO..." : "PAGAR CON MERCADO PAGO"}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase font-bold tracking-widest">
                    Pago seguro procesado por Mercado Pago
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="order-1 lg:order-2 space-y-8">
          <Card className="bg-secondary/10 border-dashed border-2 shadow-inner rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-xl">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-background p-4 rounded-2xl border shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-black text-sm uppercase tracking-tight">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.quantity} un. x ${item.price}</span>
                    </div>
                    <span className="font-black text-primary text-lg">${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <Separator className="bg-primary/20" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="flex justify-between text-3xl font-black pt-2 text-primary tracking-tighter">
                  <span>TOTAL</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
