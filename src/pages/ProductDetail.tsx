import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, Star, ArrowLeft } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="pt-24 pb-16 container mx-auto px-4 text-center">
        <p className="text-muted-foreground">Product not found</p>
        <Link to="/shop" className="text-gold text-sm mt-4 inline-block">
          Back to shop
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="aspect-[3/4] rounded overflow-hidden bg-charcoal"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-gold mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl md:text-4xl font-display text-foreground mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(product.rating) ? "text-gold fill-gold" : "text-muted-foreground"}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl text-gold font-display">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="line-gold mb-8" />

            <div className="flex gap-3">
              <Button
                onClick={() => addItem(product)}
                className="flex-1 gradient-gold text-primary-foreground font-body text-xs tracking-[0.15em] uppercase h-12 hover:shadow-gold transition-shadow"
              >
                <ShoppingBag size={16} className="mr-2" />
                Add to Bag
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWishlisted(!wishlisted)}
                className={`h-12 w-12 border-border ${
                  wishlisted ? "text-gold border-gold" : "text-muted-foreground"
                }`}
              >
                <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
              </Button>
            </div>

            <div className="mt-8 space-y-2">
              {["Complimentary shipping worldwide", "14-day return policy", "Signature gift packaging"].map((text) => (
                <p key={text} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-1 h-1 bg-gold rounded-full" />
                  {text}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
