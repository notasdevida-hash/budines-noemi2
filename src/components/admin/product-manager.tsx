
"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Loader2, Edit3, Image as ImageIcon, Upload, Package, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const generateSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export function ProductManager() {
  const db = useFirestore();
  const { toast } = useToast();
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading } = useCollection(productsQuery);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast({
        title: "Error",
        description: "Variables de Cloudinary no encontradas.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      
      if (data.secure_url) {
        setTempImageUrl(data.secure_url);
        toast({ title: "Imagen subida", description: "Foto cargada con éxito." });
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo subir la imagen.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const colRef = collection(db, 'products');
    const newDocRef = doc(colRef);
    const name = formData.get('name') as string;

    const newProduct = {
      id: newDocRef.id,
      name: name,
      slug: generateSlug(name),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      imageUrl: tempImageUrl || (formData.get('imageUrl') as string),
      description: formData.get('description') as string,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setDocumentNonBlocking(newDocRef, newProduct, { merge: true });
    setIsAddOpen(false);
    setTempImageUrl('');
    toast({ title: "Creado", description: `${newProduct.name} añadido.` });
  };

  const handleEditProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const formData = new FormData(e.currentTarget);
    const docRef = doc(db, 'products', editingProduct.id);
    const name = formData.get('name') as string;

    const updatedData = {
      name: name,
      slug: generateSlug(name),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      imageUrl: tempImageUrl || (formData.get('imageUrl') as string),
      description: formData.get('description') as string,
    };

    updateDocumentNonBlocking(docRef, updatedData);
    setEditingProduct(null);
    setTempImageUrl('');
    toast({ title: "Actualizado", description: "Cambios guardados." });
  };

  const toggleProductStatus = (productId: string, currentStatus: boolean) => {
    const docRef = doc(db, 'products', productId);
    updateDocumentNonBlocking(docRef, { active: !currentStatus });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('¿Eliminar este producto definitivamente?')) {
      const docRef = doc(db, 'products', productId);
      deleteDocumentNonBlocking(docRef);
      toast({ title: "Eliminado", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-primary/5 gap-6">
        <div className="space-y-1">
          <h3 className="font-black text-3xl flex items-center gap-3 tracking-tighter uppercase text-primary">
            <Package className="text-primary h-8 w-8" /> Inventario
          </h3>
          <p className="text-sm font-medium text-muted-foreground">Administrá el stock y precios de tus delicias.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) setTempImageUrl('');
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full md:w-auto py-8 px-8 rounded-2xl shadow-xl font-black text-lg transition-all hover:scale-105">
              <Plus className="mr-2 h-6 w-6" /> NUEVO BUDÍN
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md w-[95vw] rounded-[2.5rem] p-0 overflow-hidden">
            <DialogHeader className="p-8 pb-0">
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Agregar Producto</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[85vh]">
              <form onSubmit={handleAddProduct} className="p-8 space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] tracking-widest text-primary">Nombre del Budín</Label>
                  <Input name="name" placeholder="Ej: Budín de Arándanos" required className="py-7 rounded-2xl font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase text-[10px] tracking-widest text-primary">Precio ($)</Label>
                    <Input name="price" type="number" placeholder="4500" required className="py-7 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold uppercase text-[10px] tracking-widest text-primary">Stock</Label>
                    <Input name="stock" type="number" placeholder="20" required className="py-7 rounded-2xl font-bold" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] tracking-widest text-primary">Imagen</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="URL o subí una foto..." 
                      value={tempImageUrl} 
                      onChange={(e) => setTempImageUrl(e.target.value)}
                      className="py-7 rounded-2xl flex-grow font-medium"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="h-14 w-14 rounded-2xl border-2 border-dashed border-primary/30 hover:bg-primary/5"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? <Loader2 className="animate-spin h-6 w-6" /> : <Upload className="h-6 w-6 text-primary" />}
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] tracking-widest text-primary">Descripción</Label>
                  <Textarea name="description" placeholder="Describí este sabor..." required className="min-h-[120px] rounded-2xl font-medium p-4" />
                </div>
                <Button type="submit" className="w-full py-8 text-xl font-black rounded-2xl shadow-xl transition-all">PUBLICAR</Button>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-card/80 backdrop-blur-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-24">
              <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-none">
                    <TableHead className="w-[100px] pl-10">PRODUCTO</TableHead>
                    <TableHead></TableHead>
                    <TableHead className="whitespace-nowrap">PRECIO</TableHead>
                    <TableHead className="whitespace-nowrap">STOCK</TableHead>
                    <TableHead className="whitespace-nowrap">ESTADO</TableHead>
                    <TableHead className="text-right pr-10">ACCIONES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((prod) => (
                    <TableRow key={prod.id} className="hover:bg-primary/5 border-b border-primary/5 transition-colors">
                      <TableCell className="pl-10">
                        <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                          <Image src={prod.imageUrl} alt={prod.name} fill className="object-cover" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-black text-lg uppercase tracking-tight block min-w-[150px]">{prod.name}</span>
                      </TableCell>
                      <TableCell className="font-black text-2xl text-primary tracking-tighter">${prod.price}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={prod.stock <= 5 ? "destructive" : "secondary"} 
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${prod.stock > 5 ? 'bg-blue-50 text-blue-700 border-none' : ''}`}
                        >
                          {prod.stock} UN.
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button 
                          onClick={() => toggleProductStatus(prod.id, prod.active)}
                          className={`inline-flex items-center px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${prod.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}
                        >
                          <span className={`mr-2 h-2.5 w-2.5 rounded-full ${prod.active ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></span>
                          {prod.active ? 'Activo' : 'Pausado'}
                        </button>
                      </TableCell>
                      <TableCell className="text-right pr-10 space-x-3 whitespace-nowrap">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingProduct(prod);
                          setTempImageUrl(prod.imageUrl);
                        }} className="h-12 w-12 rounded-full hover:bg-primary/10 hover:text-primary">
                          <Edit3 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(prod.id)} className="h-12 w-12 rounded-full text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
            setTempImageUrl('');
          }
        }}>
          <DialogContent className="max-w-md w-[95vw] rounded-[2.5rem] p-0 overflow-hidden">
            <DialogHeader className="p-8 pb-0">
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Editar Budín</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[85vh]">
              <form onSubmit={handleEditProduct} className="p-8 space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] tracking-widest text-primary">Nombre</Label>
                  <Input name="name" defaultValue={editingProduct.name} required className="py-7 rounded-2xl font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase text-[10px] tracking-widest text-primary">Precio</Label>
                    <Input name="price" type="number" defaultValue={editingProduct.price} required className="py-7 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold uppercase text-[10px] tracking-widest text-primary">Stock</Label>
                    <Input name="stock" type="number" defaultValue={editingProduct.stock} required className="py-7 rounded-2xl font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] tracking-widest text-primary">Imagen</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={tempImageUrl} 
                      onChange={(e) => setTempImageUrl(e.target.value)}
                      className="py-7 rounded-2xl flex-grow font-medium"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="h-14 w-14 rounded-2xl border-2 border-dashed border-primary/30"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? <Loader2 className="animate-spin h-6 w-6" /> : <Upload className="h-6 w-6 text-primary" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] tracking-widest text-primary">Descripción</Label>
                  <Textarea name="description" defaultValue={editingProduct.description} required className="min-h-[120px] rounded-2xl font-medium p-4" />
                </div>
                <DialogFooter className="gap-3 sm:gap-0 flex-col md:flex-row">
                  <Button type="button" variant="ghost" className="rounded-2xl h-14 font-bold" onClick={() => setEditingProduct(null)}>CANCELAR</Button>
                  <Button type="submit" className="rounded-2xl h-14 font-black shadow-lg md:flex-grow">GUARDAR CAMBIOS</Button>
                </DialogFooter>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
