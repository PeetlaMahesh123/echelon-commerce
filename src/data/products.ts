import productBag from "@/assets/product-bag.jpg";
import productWatch from "@/assets/product-watch.jpg";
import productSunglasses from "@/assets/product-sunglasses.jpg";
import productPerfume from "@/assets/product-perfume.jpg";
import productShoes from "@/assets/product-shoes.jpg";
import productNecklace from "@/assets/product-necklace.jpg";
import productScarf from "@/assets/product-scarf.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

export const categories = [
  "All",
  "Bags",
  "Watches",
  "Eyewear",
  "Fragrances",
  "Shoes",
  "Jewelry",
  "Accessories",
];

export const products: Product[] = [
  {
    id: "1",
    name: "Noir Leather Tote",
    price: 2450,
    originalPrice: 2800,
    description: "Hand-stitched Italian calfskin leather tote with gold-plated hardware. A timeless silhouette for the modern connoisseur.",
    category: "Bags",
    image: productBag,
    rating: 4.9,
    reviews: 127,
    inStock: true,
    isFeatured: true,
  },
  {
    id: "2",
    name: "Royal Chronograph",
    price: 8900,
    description: "Swiss-made automatic chronograph with 18k gold case and sapphire crystal. 100m water resistance.",
    category: "Watches",
    image: productWatch,
    rating: 5.0,
    reviews: 89,
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: "3",
    name: "Aviator Noir",
    price: 680,
    description: "Polarized acetate sunglasses with titanium temples and anti-reflective coating. UV400 protection.",
    category: "Eyewear",
    image: productSunglasses,
    rating: 4.7,
    reviews: 203,
    inStock: true,
    isFeatured: true,
  },
  {
    id: "4",
    name: "Oud Impérial",
    price: 420,
    originalPrice: 480,
    description: "An opulent blend of rare oud, amber, and Bulgarian rose. 100ml Eau de Parfum.",
    category: "Fragrances",
    image: productPerfume,
    rating: 4.8,
    reviews: 312,
    inStock: true,
    isFeatured: true,
  },
  {
    id: "5",
    name: "Oxford Classique",
    price: 1250,
    description: "Benchmade cap-toe Oxford in polished black calfskin with Goodyear welt construction.",
    category: "Shoes",
    image: productShoes,
    rating: 4.9,
    reviews: 156,
    inStock: true,
  },
  {
    id: "6",
    name: "Medallion Pendant",
    price: 3200,
    description: "18k gold medallion pendant with hand-engraved heraldic motif on a Cuban link chain.",
    category: "Jewelry",
    image: productNecklace,
    rating: 5.0,
    reviews: 67,
    inStock: true,
    isNew: true,
  },
  {
    id: "7",
    name: "Silk Royale Scarf",
    price: 590,
    description: "Pure mulberry silk scarf in deep bordeaux. Hand-rolled edges with signature motif.",
    category: "Accessories",
    image: productScarf,
    rating: 4.6,
    reviews: 178,
    inStock: true,
  },
];
