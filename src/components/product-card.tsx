
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';

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
  const router = useRouter();
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (isOutOfStock) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    toast({
      title: "¡Excelente elección!",
      description: `${product.name} se sumó al carrito.`,
    });
  };

  // Navegación directa por ID de Firestore
  const productUrl = `/products/${product.id}`;

  return (
    <Card 
      className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-card flex flex-col h-full rounded-[2rem] cursor-pointer"
      onClick={() => router.push(productUrl)}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {isOutOfStock ? (
            <Badge variant="destructive" className="text-xs py-1 px-4 rounded-full font-black uppercase">Agotado</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs py-1 px-4 rounded-full font-black bg-white/90 backdrop-blur-sm text-primary uppercase shadow-lg">Artesanal</Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-8 pb-4 flex-grow">
        <div className="space-y-3">
          <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors leading-tight text-foreground">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-3xl font-black text-primary">${product.price}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-8 pt-4">
        <Button 
          onClick={handleAddToCart}
          className="w-full py-8 text-lg font-black rounded-2xl shadow-xl transition-all hover:scale-[1.03]"
          disabled={isOutOfStock}
        >
          {isOutOfStock ? (
            "No disponible"
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              AGREGAR AL CARRITO
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
