import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Checkout = () => {
  const { items, totalPrice } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

  if (items.length === 0) {
    return (
      <main className="pt-24 pb-16 container mx-auto px-4 text-center">
        <h1 className="text-2xl font-display text-foreground mb-4">Your bag is empty</h1>
        <Link to="/shop" className="text-gold text-sm hover:underline">
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display text-foreground mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Form */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h2 className="text-sm tracking-[0.15em] uppercase text-foreground mb-4">
                  Shipping Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "First Name", span: 1 },
                    { label: "Last Name", span: 1 },
                    { label: "Email", span: 2 },
                    { label: "Address", span: 2 },
                    { label: "City", span: 1 },
                    { label: "Postal Code", span: 1 },
                  ].map((field) => (
                    <div key={field.label} className={field.span === 2 ? "col-span-2" : ""}>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        className="w-full bg-secondary border border-border rounded px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="line-gold" />

              <div>
                <h2 className="text-sm tracking-[0.15em] uppercase text-foreground mb-4">
                  Payment
                </h2>
                <p className="text-xs text-muted-foreground">
                  Secure payment will be available once Stripe is connected.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded p-6 sticky top-24">
                <h2 className="text-sm tracking-[0.15em] uppercase text-foreground mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="text-foreground">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="line-gold mb-4" />
                <div className="flex justify-between text-sm mb-6">
                  <span className="text-foreground">Total</span>
                  <span className="text-gold font-display text-lg">{formatPrice(totalPrice)}</span>
                </div>
                <Button className="w-full gradient-gold text-primary-foreground font-body text-xs tracking-[0.15em] uppercase h-12">
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Checkout;
