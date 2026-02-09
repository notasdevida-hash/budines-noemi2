
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ShoppingCart, Plus, Star } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  slug?: string;
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
    e.preventDefault(); 
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

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <Card className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-card flex flex-col h-full rounded-[2rem]">
      <Link href={productUrl} className="flex-grow cursor-pointer block">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="absolute top-4 left-4 flex gap-2">
            {isOutOfStock ? (
              <Badge variant="destructive" className="text-xs py-1 px-4 rounded-full font-black uppercase">Agotado</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs py-1 px-4 rounded-full font-black bg-white/90 backdrop-blur-sm text-primary uppercase shadow-lg">Artesanal</Badge>
            )}
            {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
              <Badge className="text-xs py-1 px-4 rounded-full font-black bg-amber-500 text-white uppercase shadow-lg animate-pulse">¡Últimos {product.stock}!</Badge>
            )}
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
             <div className="flex items-center gap-1 text-yellow-400 drop-shadow-md">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <span className="text-white text-xs font-bold ml-1">(5.0)</span>
             </div>
          </div>
        </div>
        
        <CardContent className="p-8 pb-4">
          <div className="space-y-3">
            <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors leading-tight">
              {product.name}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 h-10">
              {product.description}
            </p>
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-3xl font-black text-primary">${product.price}</span>
              <span className="text-xs text-muted-foreground line-through opacity-50">$ {(product.price * 1.2).toFixed(0)}</span>
            </div>
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="p-8 pt-4 mt-auto">
        <Button 
          onClick={handleAddToCart}
          className="w-full py-8 text-lg font-black rounded-2xl shadow-xl transition-all hover:scale-[1.03] group/btn"
          disabled={isOutOfStock}
        >
          {isOutOfStock ? (
            "No disponible"
          ) : (
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
              AGREGAR AL CARRITO
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
