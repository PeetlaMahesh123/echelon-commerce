import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-900/30 text-yellow-400",
  confirmed: "bg-blue-900/30 text-blue-400",
  processing: "bg-indigo-900/30 text-indigo-400",
  shipped: "bg-cyan-900/30 text-cyan-400",
  delivered: "bg-green-900/30 text-green-400",
  cancelled: "bg-red-900/30 text-red-400",
};

const Orders = () => {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  if (!user) {
    return (
      <main className="pt-24 pb-16 container mx-auto px-4 text-center">
        <h1 className="text-2xl font-display text-foreground mb-4">Sign In Required</h1>
        <p className="text-muted-foreground mb-6">Please sign in to view your orders.</p>
        <Link to="/auth" className="text-gold text-sm hover:underline">Sign In</Link>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <Package size={24} className="text-gold" />
            <h1 className="text-3xl font-display text-foreground">My Orders</h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-gold" size={32} />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded">
              <Package size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <Link
                to="/shop"
                className="text-gold text-sm hover:underline"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                      <p className="text-sm font-mono text-foreground">{order.id.slice(0, 8)}...</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date</p>
                      <p className="text-sm text-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total</p>
                      <p className="text-lg text-gold font-display">{formatPrice(Number(order.total))}</p>
                    </div>
                    <div>
                      <span className={`text-[10px] px-3 py-1 rounded uppercase tracking-[0.1em] ${statusColors[order.status] || ""}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {(order.order_items as any[])?.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground mb-3 uppercase tracking-[0.1em]">Items</p>
                      <div className="space-y-2">
                        {(order.order_items as any[]).map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-foreground">{item.product_name}</span>
                            <span className="text-muted-foreground">
                              {item.quantity} x {formatPrice(Number(item.price))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.shipping_name && (
                    <div className="border-t border-border pt-4 mt-4">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-[0.1em]">Shipping Address</p>
                      <p className="text-sm text-foreground">
                        {order.shipping_name}
                        {order.shipping_address && <><br />{order.shipping_address}</>}
                        {order.shipping_city && <><br />{order.shipping_city}</>}
                        {order.shipping_postal_code && <>, {order.shipping_postal_code}</>}
                        {order.shipping_country && <><br />{order.shipping_country}</>}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default Orders;
