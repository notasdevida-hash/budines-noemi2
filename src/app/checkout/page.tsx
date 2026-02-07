
"use client";

import { useCart } from '@/components/cart-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { items, totalPrice, cartCount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cartCount === 0) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const customerData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
    };

    try {
      // Simulation of creating order in Firestore via API
      // In a real scenario, this calls a Server Action or API route
      console.log('Creating order for:', customerData, 'Items:', items);
      
      // Placeholder for Mercado Pago redirect
      toast({
        title: "¡Pedido Iniciado!",
        description: "Redirigiendo a Mercado Pago para completar tu compra...",
      });
      
      // Simulating a delay
      await new Promise(r => setTimeout(r, 2000));
      
      // clearCart();
      // router.push('/');
      alert("Aquí se integraría Mercado Pago. El pedido quedó en estado 'pending'.");
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar tu pedido. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (cartCount === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
        <Button asChild>
          <a href="/">Volver a la tienda</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12 text-center">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Section */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input id="name" name="name" placeholder="Juan Perez" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono de Contacto *</Label>
                  <Input id="phone" name="phone" placeholder="+54 11 1234 5678" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Opcional)</Label>
                  <Input id="email" name="email" type="email" placeholder="juan@ejemplo.com" />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full py-8 text-xl font-bold" 
                    disabled={loading}
                  >
                    {loading ? "Procesando..." : "Pagar con Mercado Pago"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Al hacer clic, serás redirigido de forma segura a Mercado Pago para completar el pago.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <div className="space-y-8">
          <Card className="bg-secondary/10">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-medium">${item.price * item.quantity}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center text-xl font-bold pt-2">
                <span>Total</span>
                <span className="text-primary">${totalPrice}</span>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-6 border rounded-lg bg-card text-sm space-y-4">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">1</span>
              </div>
              <p className="text-muted-foreground">Tus budines se preparan artesanalmente una vez confirmado el pago.</p>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <p className="text-muted-foreground">Nos contactaremos por WhatsApp para coordinar la entrega o retiro.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
