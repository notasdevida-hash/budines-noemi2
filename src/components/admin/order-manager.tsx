
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2, Eye, Calendar, User, Phone, Mail, ShoppingBag, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';

export function OrderManager() {
  const db = useFirestore();
  const ordersQuery = useMemoFirebase(() => {
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const sendWhatsAppReceipt = (order: any) => {
    const itemsText = order.items.map((i: any) => `- ${i.name} (x${i.quantity})`).join('\n');
    const text = encodeURIComponent(
      `🧁 *¡Hola ${order.customerName}!* Soy Noemi.\n\n` +
      `Gracias por tu compra. Aquí tienes el detalle de tu pedido:\n\n` +
      `📦 *Orden:* #${order.id.slice(-6)}\n` +
      `${itemsText}\n\n` +
      `💰 *Total:* $${order.total}\n` +
      `✅ *Estado:* Confirmado\n\n` +
      `¡Espero que disfrutes tus budines! ✨`
    );
    
    // Limpiar el teléfono para que solo tenga números
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`;
    
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
  };

  return (
    <Card className="shadow-lg border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Gestión de Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="font-medium text-xs">
                    {order.createdAt ? format(new Date(order.createdAt), 'dd MMM, HH:mm', { locale: es }) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{order.customerName}</span>
                      <span className="text-xs text-muted-foreground">{order.customerPhone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-primary">${order.total}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        order.status === 'paid' ? 'default' : 
                        order.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className="px-2 py-0.5 text-[10px] uppercase font-black"
                    >
                      {order.status === 'paid' ? 'Pagado' : 
                       order.status === 'pending' ? 'Pendiente' : 'Fallido'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {order.status === 'paid' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => sendWhatsAppReceipt(order)}
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hidden md:inline-flex"
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl flex items-center gap-2">
                            <ShoppingBag className="text-primary" /> Detalle de la Orden
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                          <div className="space-y-4">
                            <div className="bg-secondary/20 p-4 rounded-xl space-y-3">
                              <h4 className="font-bold text-sm uppercase text-muted-foreground tracking-wider">Cliente</h4>
                              <div className="space-y-2">
                                <p className="flex items-center gap-2 text-sm"><User className="h-4 w-4 text-primary" /> {order.customerName}</p>
                                <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-primary" /> {order.customerPhone}</p>
                                {order.customerEmail && <p className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-primary" /> {order.customerEmail}</p>}
                                <p className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-primary" /> {order.createdAt ? format(new Date(order.createdAt), 'PPPP', { locale: es }) : '-'}</p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => sendWhatsAppReceipt(order)}
                              className="w-full bg-[#25D366] hover:bg-[#128C7E] font-bold"
                            >
                              <MessageCircle className="mr-2 h-4 w-4" /> Enviar por WhatsApp
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <h4 className="font-bold text-sm uppercase text-muted-foreground tracking-wider">Productos</h4>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                  <div>
                                    <p className="font-bold text-sm">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.quantity} x ${item.price}</p>
                                  </div>
                                  <p className="font-bold text-primary">${item.price * item.quantity}</p>
                                </div>
                              ))}
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-lg font-bold">TOTAL</span>
                              <span className="text-2xl font-black text-primary">${order.total}</span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {!orders?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Aún no hay pedidos realizados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
