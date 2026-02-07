
"use client";

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { SheetClose } from '@/components/ui/sheet';

export function CartItems() {
  const { items, updateQuantity, removeItem, totalPrice, cartCount } = useCart();

  if (cartCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
        <SheetClose asChild>
          <Button variant="outline" className="w-full">Seguir comprando</Button>
        </SheetClose>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow space-y-6">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
              <Image 
                src={item.imageUrl} 
                alt={item.name} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <h4 className="font-medium text-sm">{item.name}</h4>
                <p className="text-primary font-bold text-sm">${item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-md">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-xs w-6 text-center">{item.quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-auto space-y-4 pt-6">
        <Separator />
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span>${totalPrice}</span>
        </div>
        <SheetClose asChild>
          <Button asChild className="w-full py-6 text-lg">
            <Link href="/checkout">Finalizar Compra</Link>
          </Button>
        </SheetClose>
      </div>
    </div>
  );
}
