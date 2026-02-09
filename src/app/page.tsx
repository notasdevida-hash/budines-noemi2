"use client";

import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2, Heart, Truck, Star, ChefHat, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

export default function Home() {
  const db = useFirestore();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  
  const productsQuery = useMemoFirebase(() => {
    return query(collection(db, 'products'), where('active', '==', true));
  }, [db]);

  const { data: products, isLoading } = useCollection(productsQuery);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col">
      {/* HERO SECTION - REIMAGINED */}
      <section ref={targetRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ opacity, scale }} className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1578985543813-689480955d88?q=80&w=2000&auto=format&fit=crop" 
            alt="Budines Artesanales Background"
            fill
            className="object-cover brightness-[0.4]"
            priority
          />
        </motion.div>
        
        <div className="container relative z-10 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-white text-xs font-black uppercase tracking-[0.2em] mb-4">
              <Sparkles className="w-4 h-4 text-secondary" />
              Recetas Familiares desde 2008
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-tight drop-shadow-sm">
              Budines que <br />
              <span className="text-primary italic font-serif">Aman</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
              Descubrí la verdadera repostería artesanal. <br className="hidden md:block" />
              Sin conservantes, horneados hoy, entregados en tu puerta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button asChild size="lg" className="h-16 px-10 text-lg font-black rounded-full shadow-2xl hover:scale-105 transition-all group">
                <Link href="#productos">
                  ORDENAR AHORA <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-10 text-lg font-bold rounded-full glass text-white border-white/20 hover:bg-white/20 transition-all">
                <Link href="#nosotros">CONOCÉ NUESTRA HISTORIA</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold">Deslizar</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent"></div>
        </motion.div>
      </section>

      {/* FEATURES - ELEGANT CARDS */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: ChefHat, title: "Arte en la Cocina", desc: "Cada budín es una obra única hecha a mano, respetando los tiempos naturales de horneado." },
              { icon: Heart, title: "Sabor de Hogar", desc: "Ingredientes seleccionados de productores locales para garantizar frescura absoluta." },
              { icon: Truck, title: "Entrega Directa", desc: "Logística propia para que tu pedido llegue en condiciones perfectas a CABA y GBA." }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group p-10 rounded-[3rem] bg-secondary/30 hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-primary/10"
              >
                <div className="w-16 h-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-8">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION - GRID REFINED */}
      <section id="productos" className="py-32 bg-background relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
              <span className="text-primary font-black tracking-[0.3em] uppercase text-xs">Colección de Temporada</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Nuestras Delicias</h2>
            </div>
            <p className="max-w-xs text-muted-foreground font-medium leading-relaxed">
              Explorá nuestra variedad de sabores artesanales. Desde los clásicos cítricos hasta las opciones más intensas.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14"
            >
              {products?.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* STORY SECTION - CINEMATIC */}
      <section id="nosotros" className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[3/4] rounded-[4rem] overflow-hidden shadow-2xl group"
            >
              <Image 
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop" 
                alt="Noemi Garcia Baker" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-12 left-12 right-12">
                <blockquote className="text-white text-3xl font-serif italic leading-tight mb-4">
                  "Un budín no es solo harina y azúcar; es el recuerdo de una merienda compartida."
                </blockquote>
                <p className="text-primary-foreground/80 font-bold uppercase tracking-widest text-sm">- Noemi Garcia</p>
              </div>
            </motion.div>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="text-primary font-black tracking-[0.3em] uppercase text-xs">Nuestra esencia</span>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">Hecho con <br /><span className="text-primary italic font-serif">Paciencia.</span></h2>
              </div>
              
              <div className="space-y-6 text-muted-foreground text-xl leading-relaxed font-medium">
                <p>
                  En 2008, decidí que el aroma de mi cocina debía salir a la calle. Comencé horneando para amigos, pero pronto la pasión se convirtió en una búsqueda incansable del sabor perfecto.
                </p>
                <p>
                  Hoy, mantenemos la misma escala humana. Cada pedido se hornea bajo demanda, asegurando que recibas un producto que literalmente estaba en el horno hace solo unas horas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-10 pt-6">
                <div className="border-l-2 border-primary/20 pl-6 space-y-2">
                  <h4 className="text-5xl font-black text-primary tracking-tighter">15</h4>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Años de Tradición</p>
                </div>
                <div className="border-l-2 border-primary/20 pl-6 space-y-2">
                  <h4 className="text-5xl font-black text-primary tracking-tighter">100%</h4>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Artesanal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - IMPACTFUL */}
      <section className="py-40 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-white space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
              ¿Listo para el <br /> primer bocado?
            </h2>
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-medium">
              Sumate a nuestra comunidad de amantes de lo dulce. Hacé tu pedido hoy y coordinator la entrega para cuando prefieras.
            </p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button asChild size="lg" variant="secondary" className="h-20 px-16 text-2xl font-black rounded-full shadow-2xl hover:scale-105 transition-all">
              <Link href="#productos">QUIERO MI BUDÍN</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-20 px-10 text-lg font-bold rounded-full glass text-white border-white/20 hover:bg-white/10 transition-all">
              <Link href="https://wa.me/5491112345678" target="_blank">
                <MessageCircle className="mr-2 w-6 h-6" /> CONSULTAR WHATSAPP
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}