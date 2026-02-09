"use client";

import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CartItems } from '@/components/cart-items';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 z-50 w-full transition-all duration-500 ease-out px-4 py-4 md:py-6",
      isScrolled ? "py-3" : "py-6"
    )}>
      <div className={cn(
        "container mx-auto h-20 flex items-center justify-between rounded-[2.5rem] px-8 transition-all duration-500",
        isScrolled 
          ? "bg-white/80 backdrop-blur-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] border border-white/40" 
          : "bg-transparent border border-transparent"
      )}>
        <Link href="/" className={cn(
          "text-3xl font-black tracking-tighter transition-colors flex items-center gap-3",
          isScrolled ? "text-primary" : "text-white md:text-white"
        )}>
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
            <Heart className="fill-current w-6 h-6" />
          </div>
          <span className="hidden sm:inline">Noemi</span>
        </Link>
        
        <div className={cn(
          "hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.3em] transition-colors",
          isScrolled ? "text-muted-foreground" : "text-white/80"
        )}>
          <Link href="/#productos" className="hover:text-primary transition-colors cursor-pointer">Productos</Link>
          <Link href="/#nosotros" className="hover:text-primary transition-colors cursor-pointer">Nuestra Historia</Link>
          <Link href="https://wa.me/5491112345678" target="_blank" className="hover:text-primary transition-colors cursor-pointer">Contacto</Link>
        </div>

        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "relative w-14 h-14 rounded-full transition-all duration-300",
                  isScrolled ? "bg-primary text-white shadow-xl" : "glass text-white border-white/20"
                )}
              >
                <ShoppingCart className="h-6 w-6" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center border-4 border-white shadow-xl"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col rounded-l-[4rem] border-none shadow-2xl glass">
              <SheetHeader className="pb-8 border-b border-black/5">
                <SheetTitle className="text-4xl font-black tracking-tighter uppercase">Tu Carrito</SheetTitle>
              </SheetHeader>
              <div className="flex-grow mt-8 overflow-y-auto">
                <CartItems />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}