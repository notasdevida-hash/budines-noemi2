
"use client";

import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, doc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * @fileoverview Página maestra de detalles de producto.
 * Maneja de forma inteligente tanto IDs (compatibilidad) como Slugs (SEO).
 */

export default function ProductDetailPage() {
  const params = useParams();
  const identifier = params.slug as string;
  const db = useFirestore();
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();

  // 1. Intentamos obtener por ID primero
  const docRef = useMemoFirebase(() => {
    if (!db || !identifier) return null;
    return doc(db, 'products', identifier);
  }, [db, identifier]);

  const { data: productById, isLoading: isLoadingId } = useDoc(docRef);

  // 2. Si no hay resultado por ID, buscamos por Slug
  const slugQuery = useMemoFirebase(() => {
    if (!db || !identifier || productById) return null;
    return query(collection(db, 'products'), where('slug', '==', identifier), limit(1));
  }, [db, identifier, productById]);

  const { data: productsBySlug, isLoading: isLoadingSlug } = useCollection(slugQuery);
  
  const product = productById || productsBySlug?.[0];
  const isLoading = isLoadingId || (isLoadingSlug && !productById);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center mt-20">
        <h2 className="text-2xl font-bold mb-4 uppercase tracking-tighter">Budín no encontrado</h2>
        <p className="mb-8 text-muted-foreground">No pudimos encontrar la delicia que buscas.</p>
        <Button onClick={() => router.push('/')} className="rounded-full px-8">Volver a la tienda</Button>
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
      title: "¡Agregado!",
      description: `${product.name} se sumó al carrito.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 mt-20 md:mt-28">
      {/* Schema.org para Google Rich Results */}
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
            "brand": {
              "@type": "Brand",
              "name": "Budines Noemi"
            },
            "offers": {
              "@type": "Offer",
              "url": `${siteUrl}/products/${product.slug || product.id}`,
              "priceCurrency": "ARS",
              "price": product.price,
              "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
              "itemCondition": "https://schema.org/NewCondition"
            }
          })
        }}
      />

      <Button variant="ghost" onClick={() => router.back()} className="mb-8 hover:bg-secondary rounded-full">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver atrás
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
        {/* Imagen del Producto */}
        <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl bg-muted border border-border group">
          <Image
            src={product.imageUrl}
            alt={`${product.name} artesanal - Budines Noemi`}
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-60' : 'opacity-100'}`}
            priority
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Badge variant="destructive" className="text-2xl py-2 px-6 rounded-full font-black uppercase">SIN STOCK</Badge>
            </div>
          )}
        </div>

        {/* Información del Producto */}
        <div className="space-y-8 py-4">
          <header className="space-y-4">
            <div className="flex gap-2">
               <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px]">100% Artesanal</Badge>
               {!isOutOfStock && <Badge className="bg-green-100 text-green-700 border-green-200 font-bold uppercase tracking-widest text-[10px]">Disponible Hoy</Badge>}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-none">{product.name}</h1>
            <div className="flex items-center gap-6">
              <p className="text-5xl font-black text-primary tracking-tighter">${product.price}</p>
              {product.stock !== undefined && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Disponibilidad</span>
                  <span className={`font-bold text-sm ${isOutOfStock ? 'text-destructive' : 'text-green-600'}`}>
                    {isOutOfStock ? "Agotado temporalmente" : `${product.stock} unidades`}
                  </span>
                </div>
              )}
            </div>
          </header>

          <section className="prose prose-neutral max-w-none border-t pt-8">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Sobre esta delicia</h2>
            <p className="text-foreground/80 text-lg leading-relaxed font-medium">
              {product.description}
            </p>
          </section>

          <div className="pt-8 space-y-6">
            <Button 
              size="lg" 
              className="w-full py-10 text-2xl font-black rounded-3xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-primary/20"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-3 h-7 w-7" />
              {isOutOfStock ? "PRODUCTO AGOTADO" : "AGREGAR AL CARRITO"}
            </Button>
            
            <div className="p-6 bg-secondary/30 rounded-3xl border border-dashed border-primary/30 flex items-start gap-4">
              <div className="bg-primary/20 p-2 rounded-xl">
                <Star className="w-6 h-6 text-primary fill-current" />
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-tight">
                <strong className="text-primary block mb-1">Calidad Noemi Garantizada</strong>
                Horneado en pequeñas tandas con ingredientes seleccionados de primera calidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
