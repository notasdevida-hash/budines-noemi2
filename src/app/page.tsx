
"use client";

import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const db = useFirestore();
  
  const productsQuery = useMemoFirebase(() => {
    return query(collection(db, 'products'), where('active', '==', true));
  }, [db]);

  const { data: products, isLoading } = useCollection(productsQuery);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center bg-secondary/30">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-primary">
            Budines Noemi
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Budines artesanales hechos con amor, tradición y los mejores ingredientes naturales.
          </p>
          <div className="pt-8">
            <Button asChild size="lg" className="px-12 py-8 text-xl font-bold">
              <Link href="#productos">Ver productos</Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="w-1 h-12 bg-primary/20 rounded-full"></div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="productos" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Nuestras Especialidades</h2>
            <div className="w-24 h-1 bg-primary mb-6"></div>
            <p className="text-muted-foreground max-w-lg">
              Cada budín es horneado el mismo día de entrega para garantizar la frescura y sabor que nos caracteriza.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No hay productos disponibles en este momento.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://picsum.photos/seed/reposteria/800/800" 
                alt="Proceso artesanal" 
                className="object-cover w-full h-full"
                data-ai-hint="bakery process"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Calidad Artesanal</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                En Budines Noemi, creemos que el secreto está en los detalles. Utilizamos huevos de campo, manteca de primera calidad y frutas frescas seleccionadas una por una.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Sin conservantes ni aditivos químicos. Solo sabor puro y natural, como hecho en casa.
              </p>
              <div className="pt-4 grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-primary text-xl">100% Natural</h4>
                  <p className="text-sm text-muted-foreground">Sin conservantes</p>
                </div>
                <div>
                  <h4 className="font-bold text-primary text-xl">Frescura</h4>
                  <p className="text-sm text-muted-foreground">Horneado diario</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
