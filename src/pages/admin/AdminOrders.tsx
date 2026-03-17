import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const statusOptions = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-900/30 text-yellow-400",
  confirmed: "bg-blue-900/30 text-blue-400",
  processing: "bg-indigo-900/30 text-indigo-400",
  shipped: "bg-cyan-900/30 text-cyan-400",
  delivered: "bg-green-900/30 text-green-400",
  cancelled: "bg-red-900/30 text-red-400",
};

const AdminOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: status as any })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Order status updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div>
      <h1 className="text-2xl font-display text-foreground mb-6">Orders</h1>

      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Order ID</th>
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Date</th>
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Customer</th>
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Items</th>
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Total</th>
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto" size={20} /></td></tr>
              ) : !orders || orders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="p-3">
                      <p className="text-foreground font-mono">{order.id.slice(0, 8)}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="p-3">
                      <p className="text-foreground">{order.shipping_name || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{order.shipping_email || ""}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {(order.order_items as any[])?.length || 0} items
                    </td>
                    <td className="p-3 text-gold font-medium">{formatPrice(Number(order.total))}</td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                        className={`text-[10px] px-2 py-1 rounded uppercase tracking-[0.1em] border-0 cursor-pointer focus:outline-none ${statusColors[order.status] || ""}`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s} className="bg-card text-foreground">{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
