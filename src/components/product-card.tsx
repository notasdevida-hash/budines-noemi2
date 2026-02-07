"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  stock?: number;
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita que el clic en el botón active el link de la tarjeta
    if (isOutOfStock) return;
    
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
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card flex flex-col h-full">
      <Link href={`/products/${product.id}`} className="flex-grow cursor-pointer">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Badge variant="destructive" className="text-lg py-1 px-4">SIN STOCK</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">{product.name}</h3>
            {product.stock !== undefined && !isOutOfStock && (
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                Stock: {product.stock}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2 h-10 mb-4">
            {product.description}
          </p>
          <div className="text-2xl font-bold text-primary">
            ${product.price}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-5 pt-0 mt-auto">
        <Button 
          onClick={handleAddToCart}
          className="w-full py-6 font-bold shadow-sm"
          disabled={isOutOfStock}
        >
          {isOutOfStock ? "Agotado" : "Agregar al carrito"}
        </Button>
      </CardFooter>
    </Card>
  );
}
