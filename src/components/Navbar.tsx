import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, Heart, User, LogOut, Shield, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
];

const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force navigation to home after sign out
      navigate("/");
      // Hard refresh to clear any cached state
      window.location.reload();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <nav className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-foreground"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="font-display text-xl tracking-[0.3em] text-gold uppercase">
          Aurum
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs tracking-[0.2em] uppercase transition-colors hover:text-gold ${
                location.pathname === link.path ? "text-gold" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/shop" className="text-muted-foreground hover:text-gold transition-colors">
            <Search size={18} />
          </Link>
          <Link to="/wishlist" className="text-muted-foreground hover:text-gold transition-colors hidden sm:block">
            <Heart size={18} />
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative text-muted-foreground hover:text-gold transition-colors"
          >
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-primary-foreground text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          {user && isAdmin && (
            <Link to="/admin" className="text-gold hover:text-gold-light transition-colors" title="Admin Dashboard">
              <Shield size={18} />
            </Link>
          )}
          {user && (
            <Link to="/orders" className="text-muted-foreground hover:text-gold transition-colors" title="My Orders">
              <Package size={18} />
            </Link>
          )}
          {user ? (
            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-gold transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          ) : (
            <Link to="/auth" className="text-muted-foreground hover:text-gold transition-colors">
              <User size={18} />
            </Link>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="flex flex-col gap-4 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-[0.15em] uppercase text-muted-foreground hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-[0.15em] uppercase text-muted-foreground hover:text-gold transition-colors"
                >
                  My Orders
                </Link>
              )}
              {user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  className="text-sm tracking-[0.15em] uppercase text-muted-foreground hover:text-gold transition-colors text-left"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-[0.15em] uppercase text-muted-foreground hover:text-gold transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
