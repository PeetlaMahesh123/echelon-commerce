import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;
  original_price: string;
  category_id: string;
  image_url: string;
  in_stock: boolean;
  is_new: boolean;
  is_featured: boolean;
}

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  original_price: "",
  category_id: "",
  image_url: "",
  in_stock: true,
  is_new: false,
  is_featured: false,
};

const AdminProducts = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: ProductForm) => {
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: formData.description || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category_id: formData.category_id || null,
        image_url: formData.image_url || null,
        in_stock: formData.in_stock,
        is_new: formData.is_new,
        is_featured: formData.is_featured,
      };

      if (editId) {
        const { error } = await supabase.from("products").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
      setEditId(null);
      setForm(emptyForm);
      toast({ title: editId ? "Product updated" : "Product created" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const openEdit = (product: any) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: String(product.price),
      original_price: product.original_price ? String(product.original_price) : "",
      category_id: product.category_id || "",
      image_url: product.image_url || "",
      in_stock: product.in_stock ?? true,
      is_new: product.is_new ?? false,
      is_featured: product.is_featured ?? false,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const inputClass = "w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-foreground">Products</h1>
        <Button onClick={openCreate} className="gradient-gold text-primary-foreground text-xs tracking-[0.1em] uppercase">
          <Plus size={14} className="mr-1" /> Add Product
        </Button>
      </div>

      {/* Products table */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Product</th>
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Category</th>
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Price</th>
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Status</th>
                <th className="text-right p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto" size={20} /></td></tr>
              ) : products?.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products yet</td></tr>
              ) : (
                products?.map((product: any) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img src={product.image_url} alt="" className="w-10 h-10 rounded object-cover bg-charcoal" />
                        )}
                        <div>
                          <p className="text-sm text-foreground font-medium">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{product.category?.name || "—"}</td>
                    <td className="p-3 text-gold">{formatPrice(product.price)}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {product.in_stock ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/30 text-green-400 uppercase">In Stock</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 uppercase">Out</span>
                        )}
                        {product.is_featured && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/20 text-gold uppercase">Featured</span>}
                        {product.is_new && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 uppercase">New</span>}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(product)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate(product.id); }}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {editId ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from name" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Price *</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Original Price</label>
                <input type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={inputClass}>
                <option value="">— None —</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Image URL</label>
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputClass} />
            </div>
            <div className="flex gap-6">
              {[
                { key: "in_stock" as const, label: "In Stock" },
                { key: "is_new" as const, label: "New" },
                { key: "is_featured" as const, label: "Featured" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="rounded border-border"
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saveMutation.isPending} className="flex-1 gradient-gold text-primary-foreground text-xs uppercase tracking-[0.1em]">
                {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : editId ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="text-xs uppercase tracking-[0.1em]">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
