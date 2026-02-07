
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t bg-card py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-primary">Budines Noemi</h3>
            <p className="text-sm text-muted-foreground mt-1">Dulzura artesanal desde el corazón.</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Budines Noemi. Todos los derechos reservados.</p>
            <Link 
              href="/admin" 
              className="text-[10px] text-muted-foreground hover:text-primary transition-colors opacity-30 hover:opacity-100"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
