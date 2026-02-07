
"use client";

import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2, Heart, Truck, Star, ShieldCheck, ChefHat, Instagram, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578985543813-689480955d88?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>
        <div className="container relative mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-white mb-6 drop-shadow-2xl">
              Budines <span className="text-secondary">Noemi</span>
            </h1>
            <p className="text-xl md:text-3xl text-white/90 font-medium max-w-3xl mx-auto mb-10 leading-relaxed drop-shadow">
              El sabor de lo casero, horneado con el corazón y entregado en la puerta de tu casa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-12 py-8 text-xl font-bold rounded-full hover:scale-105 transition-transform shadow-2xl">
                <Link href="#productos">Explorar Menú</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-12 py-8 text-xl font-bold rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all backdrop-blur-md">
                <Link href="#nosotros">Nuestra Historia</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: ChefHat, title: "Receta Original", desc: "Secretos familiares transmitidos por generaciones." },
              { icon: Heart, title: "100% Artesanal", desc: "Sin conservantes, solo ingredientes naturales y frescos." },
              { icon: Truck, title: "Envíos Rápidos", desc: "Recibilo hoy mismo, recién salido del horno." }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                className="flex flex-col items-center text-center space-y-4 p-8 rounded-3xl bg-secondary/10 hover:bg-secondary/20 transition-colors"
                {...fadeIn}
                transition={{ delay: i * 0.2 }}
              >
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg mb-2">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="productos" className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center mb-16 text-center">
            <motion.span {...fadeIn} className="text-primary font-bold tracking-widest uppercase mb-2">Nuestro Menú</motion.span>
            <motion.h2 {...fadeIn} className="text-4xl md:text-6xl font-black mb-6">Tentaciones de Hoy</motion.h2>
            <div className="w-24 h-2 bg-primary rounded-full mb-6"></div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {products && products.length > 0 ? (
                products.map((product, idx) => (
                  <motion.div 
                    key={product.id} 
                    {...fadeIn} 
                    transition={{ delay: idx * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground text-xl">
                  Estamos horneando nuevas delicias. ¡Vuelve pronto!
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-primary text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Lo que dicen nuestros clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Lucía M.", text: "El budín de limón es increíble, tiene el equilibrio justo de humedad. ¡No duró ni 10 minutos!" },
              { name: "Carlos R.", text: "Se nota la calidad de los ingredientes. El de chocolate belga es de otro planeta." },
              { name: "Marta S.", text: "Excelente atención y los budines llegan tibios. Un mimo para el alma." }
            ].map((t, i) => (
              <motion.div 
                key={i} 
                className="bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/10"
                whileHover={{ y: -10 }}
                {...fadeIn}
              >
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-lg italic mb-6">"{t.text}"</p>
                <p className="font-bold">- {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              className="relative"
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl rotate-3 z-10 border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000&auto=format&fit=crop" 
                  alt="Proceso artesanal" 
                  className="object-cover w-full h-full"
                  data-ai-hint="bakery bread"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-secondary rounded-full -z-10 animate-pulse"></div>
            </motion.div>
            <motion.div 
              className="space-y-8"
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-black leading-tight">Tradición que se siente en cada bocado</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Budines Noemi nació de la pasión por la pastelería familiar. No somos una fábrica, somos una cocina que respeta los tiempos del buen horneado.
              </p>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Cada pedido es especial para nosotros. Queremos que el aroma de nuestro horno llegue intacto a tu mesa.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Garantía Noemi</h4>
                    <p className="text-xs text-muted-foreground">Si no te encanta, te devolvemos el dinero.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Calidad Premium</h4>
                    <p className="text-xs text-muted-foreground">Solo usamos manteca y frutas frescas.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-secondary/10">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl font-black text-center mb-12 uppercase tracking-tighter">Preguntas Frecuentes</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="bg-white px-6 rounded-2xl border-none shadow-sm">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">¿Tienen opciones para celíacos?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Actualmente nuestra cocina maneja harinas de trigo, por lo que no podemos garantizar la ausencia de contaminación cruzada. Estamos trabajando en una línea especial.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="bg-white px-6 rounded-2xl border-none shadow-sm">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">¿Cómo es el envío?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Enviamos en CABA y GBA Norte de lunes a sábados. Si compras antes de las 11:00 AM, te llega el mismo día.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="bg-white px-6 rounded-2xl border-none shadow-sm">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">¿Cuánto duran los budines?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Al ser 100% naturales, duran 4 días a temperatura ambiente (en lugar fresco) o 7 días en heladera. También podés freezarlos hasta 3 meses.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center text-primary-foreground space-y-8">
          <motion.h2 
            className="text-5xl md:text-7xl font-black tracking-tight"
            {...fadeIn}
          >
            ¿Listo para merendar como nunca?
          </motion.h2>
          <motion.p className="text-2xl max-w-2xl mx-auto opacity-90" {...fadeIn}>
            Hace tu pedido hoy y disfrutá de la verdadera dulzura artesanal.
          </motion.p>
          <motion.div {...fadeIn} className="pt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="px-16 py-8 text-2xl font-black rounded-full shadow-2xl hover:scale-110 transition-transform">
              <Link href="#productos">PEDIR AHORA</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-12 py-8 text-xl font-bold rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all backdrop-blur-md">
              <Link href="https://wa.me/tu-numero" target="_blank">
                <MessageCircle className="mr-2" /> WhatsApp
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
