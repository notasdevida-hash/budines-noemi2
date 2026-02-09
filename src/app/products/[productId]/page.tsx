
"use client";

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ShoppingCart, Heart, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const db = useFirestore();
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();

  const docRef = useMemoFirebase(() => {
    if (!db || !productId) return null;
    return doc(db, 'products', productId);
  }, [db, productId]);

  const { data: product, isLoading } = useDoc(docRef);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Preparando dulzura...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center mt-20">
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Budín no encontrado</h2>
        <p className="mb-8 text-muted-foreground font-medium">No pudimos encontrar la delicia que buscas.</p>
        <Button onClick={() => router.push('/')} className="rounded-full px-10 py-6 text-lg font-bold shadow-xl">
          Volver a la tienda
        </Button>
      </div>
    );
  }

  const isOutOfStock = product?.stock !== undefined && product?.stock <= 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    toast({
      title: "¡Excelente elección!",
      description: `${product.name} se sumó a tu carrito.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-20 md:mt-28">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={() => router.push('/#productos')} className="mb-8 hover:bg-secondary rounded-full font-bold group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Volver al Menú
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-square rounded-[3.5rem] overflow-hidden shadow-2xl bg-muted border-8 border-white group">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-1000 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
            priority
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <Badge variant="destructive" className="text-2xl py-3 px-8 rounded-full font-black uppercase shadow-2xl">SIN STOCK</Badge>
            </div>
          )}
        </motion.div>

        <div className="space-y-8 py-4">
          <header className="space-y-4">
            <div className="flex flex-wrap gap-2">
               <Badge className="bg-primary/20 text-primary border-primary/30 font-bold uppercase tracking-widest text-[10px] py-1 px-3">
                 <Heart className="w-3 h-3 mr-1 fill-current" /> Receta de Noemi
               </Badge>
               {!isOutOfStock && (
                 <Badge className="bg-green-100 text-green-700 border-green-200 font-bold uppercase tracking-widest text-[10px] py-1 px-3">
                   <CheckCircle2 className="w-3 h-3 mr-1" /> Disponible
                 </Badge>
               )}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.9]">{product.name}</h1>
            <p className="text-6xl font-black text-primary tracking-tighter">${product.price}</p>
          </header>

          <section className="prose prose-neutral max-w-none border-t border-dashed pt-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">Descripción</h2>
            <p className="text-foreground/80 text-xl leading-relaxed font-medium italic">"{product.description}"</p>
          </section>

          <div className="pt-8">
            <Button 
              size="lg" 
              className="w-full py-10 text-2xl font-black rounded-[2rem] shadow-2xl transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-4"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-8 w-8" />
              {isOutOfStock ? "PRODUCTO AGOTADO" : "AGREGAR AL CARRITO"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
