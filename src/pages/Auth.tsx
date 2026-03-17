import { useState, memo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, User, Settings } from "lucide-react";

type AuthMode = "login" | "signup" | "admin";
type LoadingState = "idle" | "submit" | "admin";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<LoadingState>("idle");
  const { signIn, signUp, refreshAdminStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Memoized handlers to prevent unnecessary re-renders
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), []);
  const setLoginMode = useCallback(() => setMode("login"), []);
  const setSignupMode = useCallback(() => setMode("signup"), []);
  const setAdminMode = useCallback(() => setMode("admin"), []);

  const isSubmitLoading = loading === "submit";
  const isAdminLoading = loading === "admin";

  const handleAdminSignup = async () => {
    if (!email || !password || !name) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading("submit");
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) {
        toast({ title: "Error", description: signUpError.message, variant: "destructive" });
        return;
      }

      if (signUpData.user) {
        const { error: rpcError } = await supabase.rpc('assign_admin_role', {
          user_uuid: signUpData.user.id
        });

        if (!rpcError) {
          toast({ 
            title: "Admin Account Created!", 
            description: "Please check your email to confirm your account, then sign in." 
          });
          setMode("login");
          return;
        }

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: signUpData.user.id, role: 'admin' });

        if (!insertError) {
          toast({ 
            title: "Admin Account Created!", 
            description: "Please check your email to confirm your account, then sign in." 
          });
          setMode("login");
        } else {
          toast({ 
            title: "Account Created - Setup Required", 
            description: "Your account was created. Run the database setup to enable admin features.", 
            variant: "destructive" 
          });
          setMode("login");
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading("idle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("submit");

    if (mode === "admin") {
      await handleAdminSignup();
      return;
    }

    try {
      const { error } = mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password, name);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else if (mode === "login") {
        navigate("/");
      } else {
        toast({ title: "Account created", description: "Check your email to confirm your account." });
        setMode("login");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading("idle");
    }
  };

  const makeMeAdmin = async () => {
    if (!email || !password) {
      toast({ title: "Error", description: "Please enter your email and password first", variant: "destructive" });
      return;
    }

    setLoading("admin");
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) {
        toast({ title: "Error", description: signInError.message, variant: "destructive" });
        return;
      }

      const { error: rpcError } = await supabase.rpc('assign_admin_role', {
        user_uuid: signInData.user.id
      });

      if (!rpcError) {
        toast({ title: "Success!", description: "Admin role assigned. Redirecting to admin panel..." });
        await refreshAdminStatus();
        navigate("/admin");
        return;
      }

      const { error: insertError } = await supabase
        .from('user_roles')
        .upsert({ user_id: signInData.user.id, role: 'admin' }, { onConflict: 'user_id,role' });

      if (!insertError) {
        toast({ title: "Success!", description: "Admin role assigned. Redirecting to admin panel..." });
        await refreshAdminStatus();
        navigate("/admin");
      } else {
        toast({ 
          title: "Database Setup Required", 
          description: "Please run the SQL setup in Supabase.", 
          variant: "destructive" 
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading("idle");
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case "login": return "Sign In";
      case "signup": return "Create Account";
      case "admin": return "Create Admin Account";
    }
  };

  const getModeSubtitle = () => {
    switch (mode) {
      case "login": return "Welcome Back";
      case "signup": return "Join Us";
      case "admin": return "Admin Access";
    }
  };

  return (
    <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm px-4"
      >
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
            {getModeSubtitle()}
          </p>
          <h1 className="text-3xl font-display text-foreground">
            {getModeTitle()}
          </h1>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 mb-6 bg-secondary rounded p-1">
          <button
            onClick={setLoginMode}
            disabled={isSubmitLoading || isAdminLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs uppercase tracking-wider transition-colors ${
              mode === "login" ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={14} />
            Sign In
          </button>
          <button
            onClick={setSignupMode}
            disabled={isSubmitLoading || isAdminLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs uppercase tracking-wider transition-colors ${
              mode === "signup" ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={14} />
            Sign Up
          </button>
          <button
            onClick={setAdminMode}
            disabled={isSubmitLoading || isAdminLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs uppercase tracking-wider transition-colors ${
              mode === "admin" ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield size={14} />
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode !== "login" && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                required
                disabled={isSubmitLoading}
                className="w-full bg-secondary border border-border rounded px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
              />
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              disabled={isSubmitLoading}
              className="w-full bg-secondary border border-border rounded px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              minLength={6}
              disabled={isSubmitLoading}
              className="w-full bg-secondary border border-border rounded px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
            />
          </div>

          {mode === "admin" && (
            <div className="bg-gold/10 border border-gold/30 rounded p-3">
              <p className="text-xs text-gold">
                <Shield size={14} className="inline mr-1" />
                Admin accounts have full access to manage products, orders, and customers.
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitLoading || isAdminLoading}
            className="w-full gradient-gold text-primary-foreground font-body text-xs tracking-[0.15em] uppercase h-12"
          >
            {isSubmitLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Please wait...
              </>
            ) : (
              mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Create Admin Account"
            )}
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-muted-foreground hover:text-gold transition-colors">
            ← Back to Store
          </Link>
        </div>

        {mode === "login" && (
          <div className="text-center mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Settings size={14} className="text-gold" />
              <p className="text-xs text-muted-foreground">Already have an account?</p>
            </div>
            <Button
              onClick={makeMeAdmin}
              disabled={isSubmitLoading || isAdminLoading}
              variant="outline"
              size="sm"
              className="text-xs border-gold text-gold hover:bg-gold hover:text-primary-foreground"
            >
              {isAdminLoading ? (
                <>
                  <Loader2 size={12} className="mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Shield size={12} className="mr-2" />
                  Make Me Admin
                </>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground mt-3">
              Enter your credentials above, then click this button
            </p>
          </div>
        )}
      </motion.div>
    </main>
  );
};

export default memo(Auth);
