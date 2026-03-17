import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(40, 60%, 50%)", "hsl(40, 40%, 35%)", "hsl(0, 0%, 55%)", "hsl(40, 70%, 65%)", "hsl(0, 0%, 35%)", "hsl(0, 62%, 50%)"];

const AdminAnalytics = () => {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("total, status, created_at");
      if (error) throw error;
      if (!orders || orders.length === 0) {
        return { monthly: [], byStatus: [], totalRevenue: 0, avgOrder: 0, totalOrders: 0 };
      }

      // Revenue by month
      const monthlyMap: Record<string, number> = {};
      const statusMap: Record<string, number> = {};

      (orders || []).forEach((o) => {
        const d = new Date(o.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyMap[key] = (monthlyMap[key] || 0) + Number(o.total);
        statusMap[o.status] = (statusMap[o.status] || 0) + 1;
      });

      const monthly = Object.entries(monthlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, revenue]) => ({ month, revenue }));

      const byStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

      const totalRevenue = (orders || [])
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total), 0);

      const avgOrder = orders && orders.length > 0 ? totalRevenue / orders.filter((o) => o.status !== "cancelled").length : 0;

      return { monthly, byStatus, totalRevenue, avgOrder, totalOrders: orders?.length || 0 };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <div>
      <h1 className="text-2xl font-display text-foreground mb-6">Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded p-5">
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-xl font-display text-gold">{formatPrice(data?.totalRevenue || 0)}</p>
        </div>
        <div className="bg-card border border-border rounded p-5">
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Avg Order</p>
          <p className="text-xl font-display text-foreground">{formatPrice(data?.avgOrder || 0)}</p>
        </div>
        <div className="bg-card border border-border rounded p-5">
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Total Orders</p>
          <p className="text-xl font-display text-foreground">{data?.totalOrders || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded p-5">
          <h3 className="text-sm tracking-[0.15em] uppercase text-foreground mb-4">Monthly Revenue</h3>
          {data?.monthly && data.monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.monthly}>
                <XAxis dataKey="month" tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(0, 0%, 7%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: 4, fontSize: 12 }}
                  labelStyle={{ color: "hsl(40, 20%, 92%)" }}
                  formatter={(value: number) => [formatPrice(value), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="hsl(40, 60%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-xs py-20 text-center">No order data available yet</p>
          )}
        </div>

        {/* Status pie */}
        <div className="bg-card border border-border rounded p-5">
          <h3 className="text-sm tracking-[0.15em] uppercase text-foreground mb-4">Order Status</h3>
          {data?.byStatus && data.byStatus.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {data.byStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(0, 0%, 7%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: 4, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {data.byStatus.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground capitalize">{s.name}</span>
                    <span className="ml-auto text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-xs py-16 text-center">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
