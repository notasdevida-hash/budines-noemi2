
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category?: string;
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

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      <Card 
        className="group relative h-full flex flex-col overflow-hidden border-none bg-card rounded-[3rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] transition-all duration-500 cursor-pointer"
        onClick={() => router.push(`/products/${product.id}`)}
      >
        <div className="relative aspect-[10/11] overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-1000 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
            priority
          />
          
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center text-primary transform scale-50 group-hover:scale-100 transition-transform duration-500">
              <Plus className="w-8 h-8" />
            </div>
          </div>

          <div className="absolute top-6 left-6 flex flex-col gap-2">
            {isOutOfStock ? (
              <Badge variant="destructive" className="text-[10px] py-1 px-4 rounded-full font-black uppercase tracking-widest shadow-lg">Agotado</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] py-1 px-4 rounded-full font-black bg-white/95 text-primary uppercase tracking-[0.2em] shadow-xl border-none">
                {product.category || 'Artesanal'}
              </Badge>
            )}
          </div>
          
          <button className="absolute top-6 right-6 p-3 rounded-full glass text-white/80 hover:text-red-500 transition-colors">
            <Heart className="w-4 h-4" />
          </button>
        </div>
        
        <CardContent className="p-8 pb-8 flex-grow flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors leading-tight">
              {product.name}
            </h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-2 italic">
              "{product.description}"
            </p>
          </div>
          <div className="pt-6 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Precio</span>
              <span className="text-3xl font-black text-primary tracking-tighter">${product.price}</span>
            </div>
            <Button 
              onClick={handleAddToCart}
              size="icon"
              className="w-14 h-14 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
              disabled={isOutOfStock}
            >
              <ShoppingCart className="w-6 h-6" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
