
"use client";

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * @fileoverview Página de detalles de un producto específico.
 * Optimizada para SEO con Schema.org y Metadata dinámica.
 */

export default function ProductDetailPage() {
  const { productId } = useParams();
  const db = useFirestore();
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();

  const productRef = useMemoFirebase(() => {
    if (!db || !productId) return null;
    return doc(db, 'products', productId as string);
  }, [db, productId]);

  const { data: product, isLoading } = useDoc(productRef);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <Button onClick={() => router.push('/')}>Volver a la tienda</Button>
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
    <div className="container mx-auto px-4 py-12">
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
              "url": `${siteUrl}/products/${product.id}`,
              "priceCurrency": "ARS",
              "price": product.price,
              "availability": isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
              "itemCondition": "https://schema.org/NewCondition"
            }
          })
        }}
      />

      <Button variant="ghost" onClick={() => router.back()} className="mb-8 hover:bg-secondary">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la tienda
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Imagen del Producto */}
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-muted border border-border">
          <Image
            src={product.imageUrl}
            alt={`${product.name} artesanal - Budines Noemi`}
            fill
            className={`object-cover transition-opacity duration-500 ${isOutOfStock ? 'grayscale opacity-60' : 'opacity-100'}`}
            priority
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Badge variant="destructive" className="text-2xl py-2 px-6">SIN STOCK</Badge>
            </div>
          )}
        </div>

        {/* Información del Producto */}
        <div className="space-y-8">
          <header>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold text-primary">${product.price}</p>
              {product.stock !== undefined && (
                <Badge variant={isOutOfStock ? "destructive" : "secondary"} className="text-sm py-1 px-3">
                  {isOutOfStock ? "Agotado" : `Stock disponible: ${product.stock}`}
                </Badge>
              )}
            </div>
          </header>

          <section className="prose prose-neutral max-w-none border-t pt-6">
            <h2 className="text-xl font-bold mb-4">Descripción Artesanal de este {product.name}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {product.description}
            </p>
          </section>

          <div className="pt-8 space-y-4">
            <Button 
              size="lg" 
              className="w-full md:w-auto px-16 py-8 text-xl font-bold shadow-xl transition-transform hover:scale-105"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-3 h-6 w-6" />
              {isOutOfStock ? "Agotado" : "Agregar al carrito"}
            </Button>
            
            <div className="p-4 bg-secondary/20 rounded-lg border border-primary/10">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Budín artesanal horneado en Buenos Aires con ingredientes premium.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
