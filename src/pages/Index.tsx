import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-luxury.jpg";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const featured = products.filter((p) => p.isFeatured);

const Index = () => {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="Luxury jewelry on black velvet"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 text-center px-4 max-w-2xl"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-gold mb-4">
            The Art of Luxury
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display leading-tight text-foreground mb-6">
            Timeless Elegance,{" "}
            <span className="text-gold italic">Redefined</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Discover our curated collection of exquisite pieces crafted for those who appreciate the extraordinary.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase px-8 py-3.5 rounded hover:shadow-gold transition-shadow"
          >
            Explore Collection
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="line-gold" />

      {/* Featured */}
      <section className="container mx-auto px-4 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Curated For You</p>
            <h2 className="text-3xl md:text-4xl font-display text-foreground">
              Featured Pieces
            </h2>
          </div>
          <Link
            to="/shop"
            className="hidden md:flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-gold transition-colors"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4 lg:px-8 text-center max-w-xl">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Complimentary</p>
          <h2 className="text-2xl md:text-3xl font-display text-foreground mb-4">
            Free Shipping Worldwide
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Every order is carefully packaged and shipped with complimentary express delivery and signature gift wrapping.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 border border-gold text-gold text-xs tracking-[0.2em] uppercase px-8 py-3 rounded hover:bg-gold hover:text-primary-foreground transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Index;
