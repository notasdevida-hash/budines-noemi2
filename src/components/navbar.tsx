
"use client";

import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CartItems } from '@/components/cart-items';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300 px-4 py-3",
      isScrolled ? "bg-white/80 backdrop-blur-md shadow-lg border-b py-2" : "bg-transparent"
    )}>
      <div className="container mx-auto h-16 flex items-center justify-between bg-card/10 backdrop-blur-sm rounded-2xl px-6 border border-white/20">
        <Link href="/" className={cn(
          "text-2xl font-black tracking-tighter transition-colors flex items-center gap-2",
          isScrolled ? "text-primary" : "text-white md:text-primary"
        )}>
          <Heart className="fill-current w-6 h-6 text-primary" />
          Noemi
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
          <Link href="/#productos" className="hover:text-primary transition-colors">Productos</Link>
          <Link href="/#nosotros" className="hover:text-primary transition-colors">Nosotros</Link>
        </div>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 rounded-full transition-all">
                <ShoppingCart className={cn("h-6 w-6", isScrolled ? "text-primary" : "text-white md:text-primary")} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col rounded-l-[3rem]">
              <SheetHeader className="pb-6 border-b">
                <SheetTitle className="text-2xl font-black tracking-tighter">Mi Carrito</SheetTitle>
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
