
"use client";

import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, doc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ShoppingCart, Star, Heart, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

/**
 * @fileoverview Página maestra de detalles de producto.
 * Esta ruta única maneja tanto IDs de Firestore como Slugs de SEO.
 */

export default function ProductDetailPage() {
  const params = useParams();
  const identifier = params.slug as string;
  const db = useFirestore();
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();

  // 1. Intentamos obtener el documento directamente asumiendo que el identifier podría ser un ID
  const docRef = useMemoFirebase(() => {
    if (!db || !identifier) return null;
    return doc(db, 'products', identifier);
  }, [db, identifier]);

  const { data: productById, isLoading: isLoadingId } = useDoc(docRef);

  // 2. Si no hay resultado por ID (o mientras carga), buscamos por el campo 'slug'
  const slugQuery = useMemoFirebase(() => {
    if (!db || !identifier) return null;
    // Solo buscamos por slug si ya sabemos que no cargó por ID o para estar seguros
    return query(collection(db, 'products'), where('slug', '==', identifier), limit(1));
  }, [db, identifier]);

  const { data: productsBySlug, isLoading: isLoadingSlug } = useCollection(slugQuery);
  
  // El producto final es el que venga por ID o el primero de la búsqueda por slug
  const product = productById || productsBySlug?.[0];
  const isLoading = isLoadingId && isLoadingSlug;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Preparando dulzura...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center mt-20">
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Budín no encontrado</h2>
        <p className="mb-8 text-muted-foreground font-medium">No pudimos encontrar la delicia que buscas. Puede que se haya agotado o la hayamos movido.</p>
        <Button onClick={() => router.push('/')} className="rounded-full px-10 py-6 text-lg font-bold shadow-xl">
          Volver a la tienda
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://budinesnoemi.com';

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
      {/* SEO Dinámico con JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": [product.imageUrl],
            "description": product.description,
            "sku": product.id,
            "brand": { "@type": "Brand", "name": "Budines Noemi" },
            "offers": {
              "@type": "Offer",
              "url": `${siteUrl}/products/${product.slug || product.id}`,
              "priceCurrency": "ARS",
              "price": product.price,
              "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
            }
          })
        }}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button variant="ghost" onClick={() => router.push('/#productos')} className="mb-8 hover:bg-secondary rounded-full font-bold group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Volver al Menú
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
        {/* Galería de Imagen */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-square rounded-[3.5rem] overflow-hidden shadow-2xl bg-muted border-8 border-white group"
        >
          <Image
            src={product.imageUrl}
            alt={`${product.name} artesanal - Budines Noemi`}
            fill
            className={`object-cover transition-transform duration-1000 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-60' : 'opacity-100'}`}
            priority
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <Badge variant="destructive" className="text-2xl py-3 px-8 rounded-full font-black uppercase shadow-2xl">SIN STOCK</Badge>
            </div>
          )}
          <div className="absolute bottom-6 left-6">
             <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
                <div className="flex text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-xs font-black uppercase tracking-tighter">5.0 (Venta Destacada)</span>
             </div>
          </div>
        </motion.div>

        {/* Información Detallada */}
        <div className="space-y-8 py-4">
          <header className="space-y-4">
            <div className="flex flex-wrap gap-2">
               <Badge className="bg-primary/20 text-primary border-primary/30 font-bold uppercase tracking-widest text-[10px] py-1 px-3">
                 <Heart className="w-3 h-3 mr-1 fill-current" /> Receta de Noemi
               </Badge>
               {!isOutOfStock && (
                 <Badge className="bg-green-100 text-green-700 border-green-200 font-bold uppercase tracking-widest text-[10px] py-1 px-3">
                   <CheckCircle2 className="w-3 h-3 mr-1" /> Stock Disponible
                 </Badge>
               )}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.9] drop-shadow-sm">
              {product.name}
            </h1>
            <div className="flex items-center gap-6 pt-2">
              <p className="text-6xl font-black text-primary tracking-tighter">${product.price}</p>
              {product.stock !== undefined && !isOutOfStock && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Quedan solo</span>
                  <Badge variant="outline" className="font-bold text-sm border-primary/50 text-primary px-3 rounded-lg">
                    {product.stock} unidades
                  </Badge>
                </div>
              )}
            </div>
          </header>

          <section className="prose prose-neutral max-w-none border-t border-dashed pt-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">Descripción del Maestro Pastelero</h2>
            <p className="text-foreground/80 text-xl leading-relaxed font-medium italic">
              "{product.description}"
            </p>
          </section>

          <div className="pt-8 space-y-6">
            <Button 
              size="lg" 
              className="w-full py-10 text-2xl font-black rounded-[2rem] shadow-2xl transition-all hover:scale-[1.03] active:scale-95 shadow-primary/30 flex items-center justify-center gap-4"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-8 w-8" />
              {isOutOfStock ? "PRODUCTO AGOTADO" : "AGREGAR AL CARRITO"}
            </Button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-5 bg-secondary/30 rounded-3xl border border-primary/10 flex items-center gap-4">
                  <div className="bg-primary/20 p-2 rounded-xl text-primary">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-[11px] font-bold uppercase leading-tight tracking-tight">Ingredientes 100% Naturales</p>
               </div>
               <div className="p-5 bg-secondary/30 rounded-3xl border border-primary/10 flex items-center gap-4">
                  <div className="bg-primary/20 p-2 rounded-xl text-primary">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-[11px] font-bold uppercase leading-tight tracking-tight">Hecho a mano en Buenos Aires</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
