
"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Loader2, Edit3, Image as ImageIcon, Upload, CheckCircle2, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

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
        title: "Error de configuración",
        description: "Asegúrate de tener configuradas las variables de Cloudinary en Vercel.",
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
        toast({
          title: "¡Imagen subida!",
          description: "La foto se guardó correctamente en Cloudinary.",
        });
      }
    } catch (error) {
      toast({
        title: "Error al subir",
        description: "No se pudo conectar con Cloudinary. Revisa tu conexión.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const colRef = collection(db, 'products');
    const newDocRef = doc(colRef);

    const newProduct = {
      id: newDocRef.id,
      name: formData.get('name') as string,
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
    toast({ title: "Producto creado", description: `${newProduct.name} ya está en la tienda.` });
  };

  const handleEditProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const formData = new FormData(e.currentTarget);
    const docRef = doc(db, 'products', editingProduct.id);

    const updatedData = {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      imageUrl: tempImageUrl || (formData.get('imageUrl') as string),
      description: formData.get('description') as string,
    };

    updateDocumentNonBlocking(docRef, updatedData);
    setEditingProduct(null);
    setTempImageUrl('');
    toast({ title: "Producto actualizado", description: "Los cambios se guardaron correctamente." });
  };

  const toggleProductStatus = (productId: string, currentStatus: boolean) => {
    const docRef = doc(db, 'products', productId);
    updateDocumentNonBlocking(docRef, { active: !currentStatus });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('¿Estás segura de eliminar este producto para siempre?')) {
      const docRef = doc(db, 'products', productId);
      deleteDocumentNonBlocking(docRef);
      toast({ title: "Producto eliminado", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-6 rounded-xl shadow-sm border gap-4">
        <div>
          <h3 className="font-bold text-2xl flex items-center gap-2">
            <Package className="text-primary" /> Inventario de Budines
          </h3>
          <p className="text-sm text-muted-foreground">Gestiona tus productos, stock y precios.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) setTempImageUrl('');
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg font-bold">
              <Plus className="mr-2 h-5 w-5" /> Nuevo Budín
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Agregar Nuevo Budín</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label htmlFor="prod-name">Nombre del Producto</Label>
                <Input id="prod-name" name="name" placeholder="Ej: Budín de Arándanos" required className="py-6" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prod-price">Precio ($)</Label>
                  <Input id="prod-price" name="price" type="number" placeholder="4500" required className="py-6" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-stock">Stock Inicial</Label>
                  <Input id="prod-stock" name="stock" type="number" placeholder="20" required className="py-6" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Imagen del Producto</Label>
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <Input 
                      name="imageUrl" 
                      placeholder="URL o sube una foto..." 
                      value={tempImageUrl} 
                      onChange={(e) => setTempImageUrl(e.target.value)}
                      className="py-6"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-auto px-4 border-dashed border-2 hover:bg-secondary"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? <Loader2 className="animate-spin h-5 w-5" /> : <Upload className="h-5 w-5" />}
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleUpload} 
                  />
                </div>
                {tempImageUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-100">
                    <div className="relative h-10 w-10 rounded border overflow-hidden">
                      <img src={tempImageUrl} className="object-cover w-full h-full" alt="Preview" />
                    </div>
                    <span className="text-xs text-green-700 font-medium">Imagen lista</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prod-desc">Descripción Artesanal</Label>
                <Textarea id="prod-desc" name="description" placeholder="¿Qué lo hace especial?" required className="min-h-[100px]" />
              </div>
              <Button type="submit" className="w-full py-6 text-lg font-bold">Publicar Producto</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-xl border-none overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[80px] pl-6">Foto</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((prod) => (
                  <TableRow key={prod.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-6">
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden border shadow-sm group">
                        <Image src={prod.imageUrl} alt={prod.name} fill className="object-cover transition-transform group-hover:scale-110" />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-lg">{prod.name}</TableCell>
                    <TableCell className="font-black text-primary">${prod.price}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={prod.stock <= 5 ? "destructive" : "secondary"} 
                        className={`px-3 py-1 text-sm ${prod.stock > 5 ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}`}
                      >
                        {prod.stock} un.
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => toggleProductStatus(prod.id, prod.active)}
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${prod.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        <span className={`mr-2 h-2 w-2 rounded-full ${prod.active ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></span>
                        {prod.active ? 'Activo' : 'Pausado'}
                      </button>
                    </TableCell>
                    <TableCell className="text-right pr-6 space-x-2">
                      <Button variant="outline" size="icon" onClick={() => {
                        setEditingProduct(prod);
                        setTempImageUrl(prod.imageUrl);
                      }} className="hover:text-primary hover:border-primary border-primary/20">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(prod.id)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edición */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
            setTempImageUrl('');
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Editar {editingProduct.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditProduct} className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input name="name" defaultValue={editingProduct.name} required className="py-6" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Precio ($)</Label>
                  <Input name="price" type="number" defaultValue={editingProduct.price} required className="py-6" />
                </div>
                <div className="space-y-2">
                  <Label>Stock Actual</Label>
                  <Input name="stock" type="number" defaultValue={editingProduct.stock} required className="py-6" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Imagen</Label>
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <Input 
                      name="imageUrl" 
                      value={tempImageUrl} 
                      onChange={(e) => setTempImageUrl(e.target.value)}
                      className="py-6"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-auto px-4 border-dashed border-2"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? <Loader2 className="animate-spin h-5 w-5" /> : <Upload className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea name="description" defaultValue={editingProduct.description} required className="min-h-[100px]" />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="ghost" onClick={() => {
                  setEditingProduct(null);
                  setTempImageUrl('');
                }}>Cancelar</Button>
                <Button type="submit" className="font-bold">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
