import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const { items, totalPrice } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: items.map((i) => ({
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          })),
          origin_url: window.location.origin,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast({
        title: "Checkout failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display text-foreground mb-8">Checkout</h1>

          <div className="bg-card border border-border rounded p-6 space-y-4">
            <h2 className="text-sm tracking-[0.15em] uppercase text-foreground mb-2">
              Order Summary
            </h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm text-foreground">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="line-gold" />

            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Total</span>
              <span className="text-xl text-gold font-display">{formatPrice(totalPrice)}</span>
            </div>

            {!user && (
              <p className="text-xs text-muted-foreground">
                <Link to="/auth" className="text-gold hover:underline">Sign in</Link> for a faster checkout, or continue as guest.
              </p>
            )}

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full gradient-gold text-primary-foreground font-body text-xs tracking-[0.15em] uppercase h-12 hover:shadow-gold transition-shadow"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock size={14} className="mr-2" />
                  Pay with Stripe
                </>
              )}
            </Button>

            <p className="text-[10px] text-muted-foreground text-center">
              You'll be redirected to Stripe's secure checkout. Shipping address collected at payment.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Checkout;
