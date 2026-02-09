
"use client";

import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2, Heart, Truck, Star, ChefHat, MessageCircle, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';

export default function Home() {
  const db = useFirestore();
  
  const productsQuery = useMemoFirebase(() => {
    return query(collection(db, 'products'), where('active', '==', true));
  }, [db]);

  const { data: products, isLoading } = useCollection(productsQuery);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section - Optimizada con palabras clave H1 */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578985543813-689480955d88?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
        </div>
        <div className="container relative mx-auto px-4 text-center z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl">
              Budines <span className="text-secondary">Artesanales</span> Noemi
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto mb-10 leading-relaxed px-4">
              Los mejores budines caseros de Buenos Aires, horneados con amor y entregados en CABA y GBA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-6">
              <Button asChild size="lg" className="w-full sm:w-auto px-10 py-7 text-lg font-bold rounded-full shadow-2xl">
                <Link href="#productos">Ver Menú de Budines</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-10 py-7 text-lg font-bold rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all backdrop-blur-md">
                <Link href="#nosotros">Nuestra Historia en Buenos Aires</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: ChefHat, title: "Receta Original", desc: "Budines artesanales con secretos familiares de generaciones." },
              { icon: Heart, title: "Ingredientes Naturales", desc: "100% caseros, sin conservantes ni procesos industriales." },
              { icon: Truck, title: "Envíos en CABA y GBA", desc: "Recibí tu budín recién horneado hoy mismo en tu casa." }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="flex flex-col items-center text-center space-y-4 p-8 rounded-3xl bg-secondary/10 hover:bg-secondary/20 transition-all"
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg mb-2">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="productos" className="py-20 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center mb-12 text-center">
            <motion.span {...fadeIn} className="text-primary font-bold tracking-widest uppercase mb-2 text-sm">Nuestro Menú de Hoy</motion.span>
            <motion.h2 {...fadeIn} className="text-3xl md:text-6xl font-black mb-6">Budines Caseros Disponibles</motion.h2>
            <div className="w-16 h-1 bg-primary rounded-full mb-6"></div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {products && products.length > 0 ? (
                products.map((product, idx) => (
                  <motion.div 
                    key={product.id} 
                    {...fadeIn} 
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground text-lg">
                  Estamos horneando nuevas delicias artesanales. ¡Vuelve pronto!
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section id="nosotros" className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              {...fadeIn}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <Image 
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop" 
                alt="Noemi Garcia - Elaboración de budines caseros en Buenos Aires" 
                fill 
                className="object-cover"
                data-ai-hint="baker kitchen"
              />
              <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl">
                <p className="text-primary font-black text-xl italic">"La cocina es el lenguaje del amor."</p>
                <p className="text-sm font-bold mt-2">- Noemi Garcia</p>
              </div>
            </motion.div>
            
            <motion.div {...fadeIn} className="space-y-8">
              <div>
                <span className="text-primary font-bold tracking-widest uppercase text-sm">Desde 2008</span>
                <h2 className="text-4xl md:text-6xl font-black mt-2 leading-tight">Pasión por los <span className="text-primary">Budines Caseros</span></h2>
              </div>
              
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Todo comenzó en mi cocina de Buenos Aires, donde el aroma a vainilla y limón inundaba cada rincón los domingos por la tarde. Lo que empezó como un hobby para la familia se convirtió en **Budines Noemi**.
                </p>
                <p>
                  Hoy, mis budines son el resultado de años de perfeccionar recetas tradicionales. No uso conservantes ni químicos; cada producto es una pieza única de repostería artesanal argentina.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <h4 className="font-black text-3xl text-primary">15+</h4>
                  <p className="text-sm font-bold uppercase tracking-tighter">Años horneando</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-3xl text-primary">CABA</h4>
                  <p className="text-sm font-bold uppercase tracking-tighter">Zona de Entregas</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-12 px-4">Testimonios de amantes del budín</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Lucía M. (Palermo)", text: "El budín de limón es increíble, tiene el equilibrio justo de humedad. ¡El mejor de todo Buenos Aires!" },
              { name: "Carlos R. (San Isidro)", text: "Se nota la calidad de los ingredientes caseros. El de chocolate belga es de otro planeta." },
              { name: "Marta S. (Belgrano)", text: "Excelente atención y los budines llegan tibios. Un mimo para el alma artesanal." }
            ].map((t, i) => (
              <motion.div 
                key={i} 
                className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/10"
                whileHover={{ y: -5 }}
                {...fadeIn}
              >
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <p className="text-md italic mb-6">"{t.text}"</p>
                <p className="font-bold text-sm">- {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-secondary/10">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-2xl md:text-4xl font-black text-center mb-12 uppercase tracking-tighter px-4">Preguntas Frecuentes sobre envíos</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-2" className="bg-white px-6 rounded-2xl border-none shadow-sm">
              <AccordionTrigger className="text-md font-bold hover:no-underline py-6">¿A qué zonas de Buenos Aires envían?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-6">
                Realizamos envíos en toda la Capital Federal (CABA) y zona norte de GBA. Si comprás antes de las 11:00 AM, el envío llega el mismo día.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="bg-white px-6 rounded-2xl border-none shadow-sm">
              <AccordionTrigger className="text-md font-bold hover:no-underline py-6">¿Cómo conservar los budines caseros?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-6">
                Al ser 100% naturales, se mantienen frescos por 3-4 días a temperatura ambiente en su empaque original, o hasta 7 días en heladera.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center text-primary-foreground space-y-8">
          <motion.h2 className="text-4xl md:text-7xl font-black tracking-tight px-4" {...fadeIn}>
            ¿Ganas de algo dulce y casero?
          </motion.h2>
          <motion.div {...fadeIn} className="pt-8 flex flex-col sm:flex-row justify-center gap-4 px-6">
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto px-12 py-8 text-xl font-black rounded-full shadow-2xl hover:scale-105 transition-transform">
              <Link href="#productos">COMPRAR BUDINES AHORA</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-10 py-8 text-lg font-bold rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all">
              <Link href="https://wa.me/5491112345678" target="_blank">
                <MessageCircle className="mr-2" /> Consultas por WhatsApp
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
