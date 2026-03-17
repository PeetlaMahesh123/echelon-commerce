import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import type { ProductWithCategory } from "@/hooks/useProducts";
import { resolveImage } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useState, memo } from "react";

interface ProductCardProps {
  product: ProductWithCategory;
  index?: number;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

const ProductCard = memo(({ product, index = 0 }: ProductCardProps) => {
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const image = resolveImage(product);
  const categoryName = product.category?.name || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded bg-charcoal">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-secondary animate-pulse" />
          )}
          <img
            src={image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.is_new && (
              <span className="text-[10px] tracking-[0.2em] uppercase bg-gold text-primary-foreground px-2 py-0.5 rounded-sm">
                New
              </span>
            )}
            {product.original_price && (
              <span className="text-[10px] tracking-[0.2em] uppercase bg-destructive text-destructive-foreground px-2 py-0.5 rounded-sm">
                Sale
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: image,
                });
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-card/90 backdrop-blur-sm text-foreground text-[10px] tracking-[0.15em] uppercase py-2.5 rounded hover:bg-gold hover:text-primary-foreground transition-colors"
            >
              <ShoppingBag size={14} />
              Add to Bag
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setWishlisted(!wishlisted);
              }}
              className={`flex items-center justify-center w-10 rounded backdrop-blur-sm transition-colors ${
                wishlisted
                  ? "bg-gold text-primary-foreground"
                  : "bg-card/90 text-foreground hover:bg-gold hover:text-primary-foreground"
              }`}
            >
              <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </Link>

      <div className="mt-3 space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-[0.1em]">
          {categoryName}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-foreground hover:text-gold transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gold">{formatPrice(product.price)}</span>
          {product.original_price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;
