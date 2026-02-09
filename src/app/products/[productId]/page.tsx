"use client";

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ShoppingCart, Heart, CheckCircle2, Truck, Timer, Award } from 'lucide-react';
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
      <div className="flex flex-col justify-center items-center min-h-[90vh] gap-6">
        <Loader2 className="h-16 w-16 animate-spin text-primary/30" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Precalentando el horno...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="text-5xl font-black mb-6 uppercase tracking-tighter">Budín extraviado</h2>
        <p className="mb-10 text-muted-foreground text-xl">No pudimos encontrar esta delicia. ¿Probamos con otra?</p>
        <Button onClick={() => router.push('/')} size="lg" className="rounded-full px-12 py-8 text-xl font-black shadow-2xl">
          VOLVER AL CATÁLOGO
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
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <Button variant="ghost" onClick={() => router.push('/#productos')} className="group rounded-full pl-2 font-bold hover:bg-white transition-all">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            VOLVER AL MENÚ
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-start">
          {/* IMAGE SECTION */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl bg-white border-[12px] border-white group"
          >
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-[2000ms] group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
              priority
            />
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <Badge variant="destructive" className="text-3xl py-4 px-10 rounded-full font-black uppercase shadow-2xl tracking-tighter">SIN STOCK</Badge>
              </div>
            )}
            <div className="absolute bottom-8 right-8">
               <div className="w-16 h-16 rounded-full glass flex items-center justify-center text-primary shadow-2xl">
                  <Award className="w-8 h-8" />
               </div>
            </div>
          </motion.div>

          {/* INFO SECTION */}
          <div className="space-y-12">
            <header className="space-y-6">
              <div className="flex flex-wrap gap-3">
                 <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-[0.2em] text-[10px] py-1.5 px-4 rounded-full">
                   <Heart className="w-3.5 h-3.5 mr-2 fill-current" /> Receta de Noemi
                 </Badge>
                 {!isOutOfStock && (
                   <Badge className="bg-green-50 text-green-700 border-green-100 font-black uppercase tracking-[0.2em] text-[10px] py-1.5 px-4 rounded-full">
                     <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Disponible
                   </Badge>
                 )}
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter leading-[0.85]">{product.name}</h1>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl font-black text-primary tracking-tighter">${product.price}</span>
                <span className="text-muted-foreground font-medium text-lg italic">/ Unidad</span>
              </div>
            </header>

            <section className="space-y-6 border-y border-dashed py-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">El Secreto de este Budín</h2>
              <p className="text-foreground/80 text-2xl leading-relaxed font-medium italic serif">
                "{product.description}"
              </p>
            </section>

            {/* SPECS */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4 bg-secondary/30 p-5 rounded-[2rem]">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                  <Timer className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horneado</span>
                  <span className="text-sm font-bold">Hoy mismo</span>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-secondary/30 p-5 rounded-[2rem]">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Envíos</span>
                  <span className="text-sm font-bold">CABA / GBA</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Button 
                size="lg" 
                className="w-full h-24 text-2xl font-black rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(166,144,121,0.5)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-6 group"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                {isOutOfStock ? "PRODUCTO AGOTADO" : "AGREGAR AL CARRITO"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-6 font-black uppercase tracking-[0.3em]">Calidad Artesanal Garantizada</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}