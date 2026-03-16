import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AdminCustomers = () => {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-display text-foreground mb-6">Customers</h1>

      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Name</th>
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Location</th>
                <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-muted-foreground" size={20} /></td></tr>
              ) : !profiles || profiles.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No customers yet</td></tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="p-3">
                      <p className="text-sm text-foreground">{p.display_name || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{p.phone || ""}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {[p.city, p.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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

export default AdminCustomers;
