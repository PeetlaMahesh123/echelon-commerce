import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  ArrowLeft,
  LogOut,
  Loader2,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Customers", path: "/admin/customers", icon: Users },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-display text-foreground mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground mb-6">You don't have admin privileges.</p>
          <Link to="/" className="text-gold text-sm hover:underline">← Back to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-5 border-b border-border">
          <Link to="/" className="font-display text-lg tracking-[0.3em] text-gold uppercase">
            Aurum
          </Link>
          <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase mt-1">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {adminNav.map((item) => {
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs tracking-[0.1em] uppercase transition-colors ${
                  isActive
                    ? "bg-accent text-gold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded text-xs tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Store
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2.5 rounded text-xs tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors w-full"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
