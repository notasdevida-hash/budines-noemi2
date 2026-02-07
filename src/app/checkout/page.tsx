
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
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export default function CheckoutPage() {
  const { items, totalPrice, cartCount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cartCount === 0) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Generar un ID para el pedido
    const ordersRef = collection(db, 'orders');
    const newOrderRef = doc(ordersRef);

    const orderData = {
      id: newOrderRef.id,
      customerName: formData.get('name') as string,
      customerPhone: formData.get('phone') as string,
      customerEmail: (formData.get('email') as string) || '',
      productIds: items.map(item => item.id), // Almacenamos los IDs de los productos
      cartDetails: items.map(item => ({ // Detalle extra para el administrador
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: totalPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      // Guardamos el pedido en Firestore de forma no bloqueante
      setDocumentNonBlocking(newOrderRef, orderData, { merge: true });
      
      toast({
        title: "¡Pedido Recibido!",
        description: "Estamos procesando tu pedido. Redirigiendo...",
      });
      
      // Simulamos la redirección a Mercado Pago
      // En el futuro, aquí llamarías a tu API para obtener el init_point
      setTimeout(() => {
        clearCart();
        router.push('/');
        toast({
          title: "Simulación de Pago",
          description: "Tu pedido ha sido registrado como 'Pendiente' en el panel admin.",
        });
      }, 2000);
      
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
                    {loading ? "Procesando..." : "Confirmar Pedido"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Al confirmar, tu pedido aparecerá en nuestro sistema y coordinaremos el pago.
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
              <p className="text-muted-foreground">Tus budines se preparan artesanalmente una vez confirmado el pedido.</p>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <p className="text-muted-foreground">Nos contactaremos por WhatsApp para coordinar la entrega y el pago.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
