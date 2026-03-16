import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Local images for seeded products (matched by slug)
import productBag from "@/assets/product-bag.jpg";
import productWatch from "@/assets/product-watch.jpg";
import productSunglasses from "@/assets/product-sunglasses.jpg";
import productPerfume from "@/assets/product-perfume.jpg";
import productShoes from "@/assets/product-shoes.jpg";
import productNecklace from "@/assets/product-necklace.jpg";
import productScarf from "@/assets/product-scarf.jpg";

const localImages: Record<string, string> = {
  "noir-leather-tote": productBag,
  "royal-chronograph": productWatch,
  "aviator-noir": productSunglasses,
  "oud-imperial": productPerfume,
  "oxford-classique": productShoes,
  "medallion-pendant": productNecklace,
  "silk-royale-scarf": productScarf,
};

export interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  images: string[] | null;
  rating: number | null;
  review_count: number | null;
  in_stock: boolean | null;
  is_new: boolean | null;
  is_featured: boolean | null;
  category: { id: string; name: string; slug: string } | null;
}

export function resolveImage(product: { slug: string; image_url: string | null }) {
  return localImages[product.slug] || product.image_url || "/placeholder.svg";
}

export function useProducts(category?: string) {
  return useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, category:categories(id, name, slug)")
        .order("created_at", { ascending: false });

      if (category && category !== "All") {
        query = query.eq("categories.name", category);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter out products where category didn't match the join filter
      let results = (data as unknown as ProductWithCategory[]) || [];
      if (category && category !== "All") {
        results = results.filter((p) => p.category?.name === category);
      }
      return results;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(id, name, slug)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as ProductWithCategory;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}
