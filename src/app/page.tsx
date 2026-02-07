
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Initial demo products until Firestore is populated
const DEMO_PRODUCTS = [
  {
    id: '1',
    name: 'Budín de Limón',
    price: 1500,
    imageUrl: PlaceHolderImages[0].imageUrl,
    description: 'Fresco, cítrico y con un glaseado irresistible de limón real.',
  },
  {
    id: '2',
    name: 'Budín de Chocolate',
    price: 1800,
    imageUrl: PlaceHolderImages[1].imageUrl,
    description: 'Para los amantes del chocolate intenso, con trozos de chocolate belga.',
  },
  {
    id: '3',
    name: 'Budín de Vainilla',
    price: 1400,
    imageUrl: PlaceHolderImages[2].imageUrl,
    description: 'El clásico sabor que nunca falla, suave y aromático.',
  },
];

export default function Home() {
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DEMO_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
