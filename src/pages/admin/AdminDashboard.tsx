import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, profiles] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total, status, created_at"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      const orderData = orders.data || [];
      const totalRevenue = orderData
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total), 0);
      const pendingOrders = orderData.filter((o) => o.status === "pending").length;

      return {
        productCount: products.count || 0,
        orderCount: orderData.length,
        customerCount: profiles.count || 0,
        totalRevenue,
        pendingOrders,
        recentOrders: orderData.slice(0, 5),
      };
    },
  });

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const statCards = [
    { label: "Total Revenue", value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: "text-gold" },
    { label: "Orders", value: stats?.orderCount || 0, icon: ShoppingCart, color: "text-gold" },
    { label: "Products", value: stats?.productCount || 0, icon: Package, color: "text-gold" },
    { label: "Customers", value: stats?.customerCount || 0, icon: Users, color: "text-gold" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display text-foreground mb-6">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                {card.label}
              </span>
              <card.icon size={16} className={card.color} />
            </div>
            <p className="text-xl font-display text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          to="/admin/products"
          className="bg-card border border-border rounded p-5 hover:border-gold transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <Package size={18} className="text-gold" />
            <h3 className="text-sm font-medium text-foreground">Manage Products</h3>
          </div>
          <p className="text-xs text-muted-foreground">Add, edit, or remove products from your catalog</p>
        </Link>
        <Link
          to="/admin/orders"
          className="bg-card border border-border rounded p-5 hover:border-gold transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart size={18} className="text-gold" />
            <h3 className="text-sm font-medium text-foreground">
              View Orders
              {(stats?.pendingOrders || 0) > 0 && (
                <span className="ml-2 bg-gold text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                  {stats?.pendingOrders} pending
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">Track and manage customer orders</p>
        </Link>
      </div>

      {/* Recent orders */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <div className="bg-card border border-border rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm tracking-[0.15em] uppercase text-foreground">Recent Orders</h3>
            <Link to="/admin/orders" className="text-[10px] text-gold hover:underline uppercase tracking-[0.1em]">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-xs text-foreground">{order.id.slice(0, 8)}...</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-[0.1em] ${
                    order.status === "delivered" ? "bg-green-900/30 text-green-400" :
                    order.status === "cancelled" ? "bg-red-900/30 text-red-400" :
                    order.status === "pending" ? "bg-yellow-900/30 text-yellow-400" :
                    "bg-blue-900/30 text-blue-400"
                  }`}>
                    {order.status}
                  </span>
                  <span className="text-xs text-gold">{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
