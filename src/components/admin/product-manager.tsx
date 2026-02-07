
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Loader2, Edit3, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export function ProductManager() {
  const db = useFirestore();
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading } = useCollection(productsQuery);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

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
      imageUrl: formData.get('imageUrl') as string,
      description: formData.get('description') as string,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setDocumentNonBlocking(newDocRef, newProduct, { merge: true });
    setIsAddOpen(false);
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
      imageUrl: formData.get('imageUrl') as string,
      description: formData.get('description') as string,
    };

    updateDocumentNonBlocking(docRef, updatedData);
    setEditingProduct(null);
  };

  const toggleProductStatus = (productId: string, currentStatus: boolean) => {
    const docRef = doc(db, 'products', productId);
    updateDocumentNonBlocking(docRef, { active: !currentStatus });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('¿Estás segura de eliminar este producto para siempre?')) {
      const docRef = doc(db, 'products', productId);
      deleteDocumentNonBlocking(docRef);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl shadow-sm border">
        <h3 className="font-bold text-lg">Inventario Actual</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Budín
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                <Label htmlFor="prod-img">URL de la Imagen (Cloudinary/Unsplash)</Label>
                <div className="relative">
                  <Input id="prod-img" name="imageUrl" placeholder="https://..." required className="py-6 pl-10" />
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-desc">Descripción Artesanal</Label>
                <Textarea id="prod-desc" name="description" placeholder="Cuéntales qué hace especial a este budín..." required className="min-h-[120px]" />
              </div>
              <Button type="submit" className="w-full py-6 text-lg font-bold">Publicar Producto</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg border-none overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[100px]">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((prod) => (
                  <TableRow key={prod.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden border">
                        <Image src={prod.imageUrl} alt={prod.name} fill className="object-cover" />
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{prod.name}</TableCell>
                    <TableCell className="font-medium text-primary">${prod.price}</TableCell>
                    <TableCell>
                      <Badge variant={prod.stock < 5 ? "destructive" : "secondary"} className="px-3">
                        {prod.stock} un.
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => toggleProductStatus(prod.id, prod.active)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold transition-all ${prod.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${prod.active ? 'bg-green-600 animate-pulse' : 'bg-gray-400'}`}></span>
                        {prod.active ? 'Activo' : 'Pausado'}
                      </button>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => setEditingProduct(prod)} className="hover:text-primary border-primary/20">
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
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Editar {editingProduct.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditProduct} className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input name="name" defaultValue={editingProduct.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Precio ($)</Label>
                  <Input name="price" type="number" defaultValue={editingProduct.price} required />
                </div>
                <div className="space-y-2">
                  <Label>Stock Actual</Label>
                  <Input name="stock" type="number" defaultValue={editingProduct.stock} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL Imagen</Label>
                <Input name="imageUrl" defaultValue={editingProduct.imageUrl} required />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea name="description" defaultValue={editingProduct.description} required className="min-h-[100px]" />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditingProduct(null)}>Cancelar</Button>
                <Button type="submit">Actualizar Producto</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
