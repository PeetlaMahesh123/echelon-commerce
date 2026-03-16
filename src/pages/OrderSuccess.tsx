import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center px-4 max-w-md"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle size={64} className="text-gold" />
        </div>
        <h1 className="text-3xl font-display text-foreground mb-3">Order Confirmed</h1>
        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        {sessionId && (
          <p className="text-[10px] text-muted-foreground mb-8">
            Session: {sessionId.slice(0, 20)}...
          </p>
        )}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 gradient-gold text-primary-foreground text-xs tracking-[0.2em] uppercase px-8 py-3.5 rounded hover:shadow-gold transition-shadow"
        >
          Continue Shopping
        </Link>
      </motion.div>
    </main>
  );
};

export default OrderSuccess;
