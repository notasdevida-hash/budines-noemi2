"use client";

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, ShieldCheck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Bienvenida Noemi",
        description: "Acceso concedido al panel de control.",
      });
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: "Error de acceso",
        description: error.message || "Credenciales incorrectas o problema de conexión.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-[80vh] flex flex-col items-center justify-center gap-8">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Acceso Admin</CardTitle>
          <CardDescription>Solo personal autorizado para la gestión de productos y pedidos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@ejemplo.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
              {loading ? "Verificando..." : "Ingresar al Panel"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="w-full max-w-md">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="setup" className="border-none">
            <AccordionTrigger className="text-sm text-muted-foreground hover:no-underline">
              ¿Cómo configurar mi cuenta de administrador?
            </AccordionTrigger>
            <AccordionContent>
              <Alert className="bg-secondary/20 border-primary/20">
                <Info className="h-4 w-4" />
                <AlertTitle className="font-bold">Pasos para el desarrollador:</AlertTitle>
                <AlertDescription className="text-xs space-y-2 mt-2">
                  <p>1. Ve a <strong>Firebase Console</strong> &gt; <strong>Authentication</strong> y crea un usuario con email y contraseña.</p>
                  <p>2. Copia el <strong>User UID</strong> de ese nuevo usuario.</p>
                  <p>3. Ve a <strong>Firestore Database</strong>, crea una colección llamada <code>roles_admin</code>.</p>
                  <p>4. Crea un documento cuyo <strong>Document ID</strong> sea exactamente el <strong>UID</strong> que copiaste. (No necesita campos).</p>
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
