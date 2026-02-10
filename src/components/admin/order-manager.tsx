
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
    
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`;
    
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
  };

  return (
    <Card className="shadow-xl border-none overflow-hidden rounded-[2rem]">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">Gestión de Pedidos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary/30" />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="whitespace-nowrap px-6">Fecha</TableHead>
                  <TableHead className="whitespace-nowrap">Cliente</TableHead>
                  <TableHead className="whitespace-nowrap">Total</TableHead>
                  <TableHead className="whitespace-nowrap">Estado</TableHead>
                  <TableHead className="text-right px-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="px-6 font-bold text-[10px] uppercase text-muted-foreground whitespace-nowrap">
                      {order.createdAt ? format(new Date(order.createdAt), 'dd MMM, HH:mm', { locale: es }) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-[150px]">
                        <span className="font-black text-sm uppercase tracking-tight">{order.customerName}</span>
                        <span className="text-xs text-muted-foreground">{order.customerPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-primary text-lg">${order.total}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          order.status === 'paid' ? 'default' : 
                          order.status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className="px-3 py-1 text-[9px] uppercase font-black tracking-widest rounded-full"
                      >
                        {order.status === 'paid' ? 'Pagado' : 
                         order.status === 'pending' ? 'Pendiente' : 'Fallido'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6 space-x-2 whitespace-nowrap">
                      {order.status === 'paid' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => sendWhatsAppReceipt(order)}
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 rounded-full h-10 w-10 p-0 md:w-auto md:px-4"
                        >
                          <MessageCircle className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">WhatsApp</span>
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl w-[95vw] md:w-full rounded-[2rem] p-0 overflow-hidden">
                          <DialogHeader className="p-8 pb-0">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                              <ShoppingBag className="text-primary h-8 w-8" /> Detalle del Pedido
                            </DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-[80vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 pt-6">
                              <div className="space-y-6">
                                <div className="bg-secondary/30 p-6 rounded-[2rem] space-y-4 border border-primary/5">
                                  <h4 className="font-black text-[10px] uppercase text-primary tracking-[0.2em]">Información del Cliente</h4>
                                  <div className="space-y-3">
                                    <p className="flex items-center gap-3 text-sm font-bold"><User className="h-4 w-4 text-primary" /> {order.customerName}</p>
                                    <p className="flex items-center gap-3 text-sm font-bold"><Phone className="h-4 w-4 text-primary" /> {order.customerPhone}</p>
                                    {order.customerEmail && <p className="flex items-center gap-3 text-sm font-bold"><Mail className="h-4 w-4 text-primary" /> {order.customerEmail}</p>}
                                    <p className="flex items-center gap-3 text-sm text-muted-foreground font-medium"><Calendar className="h-4 w-4" /> {order.createdAt ? format(new Date(order.createdAt), 'PPPP', { locale: es }) : '-'}</p>
                                  </div>
                                </div>
                                <Button 
                                  onClick={() => sendWhatsAppReceipt(order)}
                                  className="w-full py-8 text-lg font-black rounded-2xl bg-[#25D366] hover:bg-[#128C7E] shadow-xl transition-all hover:scale-[1.02]"
                                >
                                  <MessageCircle className="mr-3 h-6 w-6" /> ENVIAR RECIBO
                                </Button>
                              </div>
                              <div className="space-y-6">
                                <h4 className="font-black text-[10px] uppercase text-primary tracking-[0.2em]">Resumen de Productos</h4>
                                <div className="space-y-3 pr-2">
                                  {order.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-background border rounded-2xl shadow-sm">
                                      <div className="space-y-1">
                                        <p className="font-black text-sm uppercase leading-none">{item.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground">{item.quantity} x ${item.price}</p>
                                      </div>
                                      <p className="font-black text-primary">${item.price * item.quantity}</p>
                                    </div>
                                  ))}
                                </div>
                                <Separator className="bg-primary/10" />
                                <div className="flex justify-between items-center pt-2">
                                  <span className="text-lg font-black uppercase tracking-tighter text-muted-foreground">TOTAL</span>
                                  <span className="text-3xl font-black text-primary tracking-tighter">${order.total}</span>
                                </div>
                              </div>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
                {!orders?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-bold italic">
                      No se han registrado pedidos todavía.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
