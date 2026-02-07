
import Link from 'next/link';
import { Instagram, Facebook, MessageCircle, Heart, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-card border-t py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link href="/" className="text-3xl font-black tracking-tighter text-primary flex items-center gap-2">
              <Heart className="fill-current w-8 h-8" /> Noemi
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              Budines artesanales hechos con amor, tradición y los mejores ingredientes naturales para alegrar tus meriendas.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <MessageCircle className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Navegación</h4>
            <ul className="space-y-4 text-muted-foreground font-medium">
              <li><Link href="/" className="hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link href="/#productos" className="hover:text-primary transition-colors">Nuestros Budines</Link></li>
              <li><Link href="/#nosotros" className="hover:text-primary transition-colors">Sobre Noemi</Link></li>
              <li><Link href="/checkout" className="hover:text-primary transition-colors">Checkout</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Contacto</h4>
            <ul className="space-y-4 text-muted-foreground font-medium">
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> +54 9 11 1234 5678</li>
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> hola@budinesnoemi.com</li>
              <li className="flex items-center gap-3">Zona de entrega: CABA & GBA</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Horarios</h4>
            <p className="text-muted-foreground font-medium mb-4">
              Horneamos de Lunes a Sábado.<br />
              Entregas de 14:00 a 20:00 hs.
            </p>
            <div className="p-4 bg-secondary/20 rounded-2xl border border-primary/10">
              <p className="text-xs font-bold text-primary italic">"Cualquier momento es bueno para un budín calentito."</p>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Budines Noemi. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/admin" className="opacity-30 hover:opacity-100 transition-opacity">Panel Admin</Link>
            <Link href="#" className="hover:text-primary transition-colors">Términos y Condiciones</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
