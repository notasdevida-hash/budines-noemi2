
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    toast({
      title: "¡Agregado!",
      description: `${product.name} se sumó al carrito.`,
    });
  };

  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <CardContent className="p-5">
        <h3 className="text-xl font-bold tracking-tight mb-2">{product.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 h-10 mb-4">
          {product.description}
        </p>
        <div className="text-2xl font-bold text-primary">
          ${product.price}
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full py-6 font-bold shadow-sm"
        >
          Agregar al carrito
        </Button>
      </CardFooter>
    </Card>
  );
}
