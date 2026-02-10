
"use client";

import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2, Heart, Truck, Star, ChefHat, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';

const HERO_IMAGES = [
  "https://res.cloudinary.com/dm2g8wqvx/image/upload/v1770704844/2_qauruh.png",
  "https://res.cloudinary.com/dm2g8wqvx/image/upload/v1770704848/Captura_de_pantalla_2026-02-10_032403_rpnztt.png",
  "https://res.cloudinary.com/dm2g8wqvx/image/upload/v1770704847/3_qlhjpj.png",
  "https://res.cloudinary.com/dm2g8wqvx/image/upload/v1770704848/4_r26mqg.png",
  "https://res.cloudinary.com/dm2g8wqvx/image/upload/v1770704846/5_qo6kk5.png"
];

export default function Home() {
  const db = useFirestore();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); // Cambia cada 5 segundos
    return () => clearInterval(timer);
  }, []);

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  
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
      {/* HERO SECTION - REIMAGINED WITH AUTOMATIC CAROUSEL */}
      <section ref={targetRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        <motion.div style={{ opacity, scale }} className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={HERO_IMAGES[currentImageIndex]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image 
                src={HERO_IMAGES[currentImageIndex]} 
                alt={`Budines Artesanales Slide ${currentImageIndex + 1}`}
                fill
                className="object-cover brightness-[0.5]"
                priority
              />
            </motion.div>
          </AnimatePresence>
          {/* Overlay constant to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
        </motion.div>
        
        <div className="container relative z-10 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass text-primary text-xs font-black uppercase tracking-[0.3em] mb-4 shadow-xl border border-white/20">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Recetas Familiares desde 2008
            </div>
            
            <h1 className="text-7xl md:text-[10rem] font-black text-white tracking-tighter leading-[0.85] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              Creaciones que <br />
              <span className="text-primary italic font-serif">Inspiran</span>
            </h1>
            
            <p className="text-xl md:text-3xl text-white/95 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
              Descubrí la verdadera repostería artesanal. <br className="hidden md:block" />
              Sin conservantes, horneados hoy, entregados en tu puerta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-10">
              <Button asChild size="lg" className="h-20 px-12 text-xl font-black rounded-full shadow-[0_20px_50px_rgba(166,144,121,0.4)] hover:scale-105 transition-all group">
                <Link href="#productos">
                  ORDENAR AHORA <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-20 px-12 text-lg font-bold rounded-full glass text-white border-white/30 hover:bg-white/20 transition-all backdrop-blur-md">
                <Link href="#nosotros">NUESTRA HISTORIA</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImageIndex(i)}
              className={`h-2 rounded-full transition-all duration-700 ${
                currentImageIndex === i ? "w-12 bg-primary shadow-[0_0_15px_rgba(166,144,121,0.8)]" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-3"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] font-black">Explorar</span>
          <div className="w-px h-16 bg-gradient-to-b from-white/60 to-transparent"></div>
        </motion.div>
      </section>

      {/* FEATURES - ELEGANT CARDS */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: ChefHat, title: "Arte en la Cocina", desc: "Cada budín es una obra única hecha a mano, respetando los tiempos naturales de horneado." },
              { icon: Heart, title: "Sabor de Hogar", desc: "Ingredientes seleccionados de productores locales para garantizar frescura absoluta." },
              { icon: Truck, title: "Entrega Directa", desc: "Logística propia para que tu pedido llegue en condiciones perfectas a CABA y GBA." }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group p-12 rounded-[4rem] bg-secondary/30 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 border border-transparent hover:border-primary/5"
              >
                <div className="w-20 h-20 bg-primary text-primary-foreground rounded-[2rem] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all mb-10">
                  <item.icon className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black mb-5 tracking-tight text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium text-lg">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION - GRID REFINED */}
      <section id="productos" className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
            <div className="space-y-6">
              <span className="text-primary font-black tracking-[0.5em] uppercase text-xs block">Colección de Temporada</span>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-none">Nuestras <br />Delicias</h2>
            </div>
            <p className="max-w-sm text-muted-foreground font-medium text-xl leading-relaxed italic">
              "Explorá nuestra variedad de sabores artesanales. Cada bocado cuenta una historia de paciencia y amor."
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-40">
              <Loader2 className="h-20 w-20 animate-spin text-primary/10" />
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16"
            >
              {products?.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
        
        {/* Subtle decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      </section>

      {/* STORY SECTION - CINEMATIC */}
      <section id="nosotros" className="py-40 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[3/4] rounded-[5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] group border-[16px] border-secondary/20"
            >
              <Image 
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop" 
                alt="Noemi Garcia Baker" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-[3000ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-16 left-16 right-16">
                <blockquote className="text-white text-4xl font-serif italic leading-tight mb-6 drop-shadow-lg">
                  "Un budín no es solo harina y azúcar; es el recuerdo de una merienda compartida."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-primary"></div>
                  <p className="text-primary-foreground font-black uppercase tracking-[0.3em] text-xs">Noemi Garcia</p>
                </div>
              </div>
            </motion.div>
            
            <div className="space-y-12">
              <div className="space-y-6">
                <span className="text-primary font-black tracking-[0.4em] uppercase text-xs block">Nuestra esencia</span>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-foreground">Hecho con <br /><span className="text-primary italic font-serif">Paciencia.</span></h2>
              </div>
              
              <div className="space-y-8 text-muted-foreground text-2xl leading-relaxed font-medium italic">
                <p>
                  En 2008, decidí que el aroma de mi cocina debía salir a la calle. Comencé horneando para amigos, pero pronto la pasión se convirtió en una búsqueda incansable del sabor perfecto.
                </p>
                <p>
                  Hoy, mantenemos la misma escala humana. Cada pedido se hornea bajo demanda, asegurando que recibas un producto que literalmente estaba en el horno hace solo unas horas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-12 pt-8">
                <div className="border-l-[6px] border-primary/20 pl-8 space-y-3">
                  <h4 className="text-6xl font-black text-primary tracking-tighter">15</h4>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Años de Tradición</p>
                </div>
                <div className="border-l-[6px] border-primary/20 pl-8 space-y-3">
                  <h4 className="text-6xl font-black text-primary tracking-tighter">100%</h4>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Artesanal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - IMPACTFUL */}
      <section className="py-48 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_white_0%,_transparent_70%)]"></div>
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center text-primary-foreground space-y-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-none drop-shadow-2xl">
              ¿Listo para el <br /> primer bocado?
            </h2>
            <p className="text-2xl md:text-4xl text-primary-foreground/90 max-w-3xl mx-auto font-medium leading-relaxed">
              Sumate a nuestra comunidad de amantes de lo dulce. Hacé tu pedido hoy y coordinemos la entrega.
            </p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-8">
            <Button asChild size="lg" variant="secondary" className="h-24 px-20 text-3xl font-black rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.3)] hover:scale-105 transition-all">
              <Link href="#productos">QUIERO MI BUDÍN</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-24 px-12 text-xl font-bold rounded-full glass text-white border-white/40 hover:bg-white/20 transition-all backdrop-blur-xl">
              <Link href="https://wa.me/5491112345678" target="_blank">
                <MessageCircle className="mr-3 w-8 h-8" /> CONSULTAR WHATSAPP
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Animated background shapes */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-[4rem] blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/10 rounded-[4rem] blur-3xl"
        />
      </section>
    </div>
  );
}
