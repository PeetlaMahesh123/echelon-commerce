import { useState, memo, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, User, Settings, CheckCircle, AlertCircle } from "lucide-react";

type AuthMode = "login" | "signup" | "admin";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, refreshAdminStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Clear any stuck sessions on mount
  useEffect(() => {
    const clearStuckSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Found existing session, clearing...');
          await supabase.auth.signOut();
          localStorage.removeItem('sb-dqcxljpkrlbaolxbzmxe-auth-token');
        }
      } catch (err) {
        console.log('No session to clear');
      }
    };
    clearStuckSession();
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), []);
  const setLoginMode = useCallback(() => { setMode("login"); setError(null); }, []);
  const setSignupMode = useCallback(() => { setMode("signup"); setError(null); }, []);
  const setAdminMode = useCallback(() => { setMode("admin"); setError(null); }, []);

  const handleAdminSignup = async () => {
    if (!email || !password || !name) {
      setError("Please fill in all fields");
      return false;
    }

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return false;
      }

      if (signUpData.user) {
        try {
          await supabase.rpc('assign_admin_role', { user_uuid: signUpData.user.id });
        } catch {
          await supabase.from('user_roles').insert({ user_id: signUpData.user.id, role: 'admin' });
        }
        
        toast({ 
          title: "Admin Account Created!", 
          description: "Please check your email and click the verification link." 
        });
        return true;
      }
      return false;
    } catch (error: any) {
      setError(error?.message || "Failed to create account");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "admin") {
        const success = await handleAdminSignup();
        if (success) {
          setMode("login");
        }
        setIsLoading(false);
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });

        if (error) {
          if (error.message?.includes("User already registered")) {
            setError("An account with this email already exists. Please sign in.");
          } else {
            setError(error.message);
          }
        } else if (data.user?.identities?.length === 0) {
          setError("An account with this email already exists. Please sign in.");
        } else {
          toast({ 
            title: "Account Created!", 
            description: "Please check your email and click the verification link." 
          });
          setMode("login");
        }
      } else {
        // Login mode
        const { error } = await signIn(email, password);

        if (error) {
          const errorMsg = error.message || "";
          if (errorMsg.includes("Invalid login credentials")) {
            setError("Invalid email or password. Please try again.");
          } else if (errorMsg.includes("Email not confirmed")) {
            setError("Please verify your email before signing in. Check your inbox.");
          } else if (errorMsg.includes("timeout")) {
            setError("Connection timeout. Please disable browser extensions and try again.");
          } else {
            setError(errorMsg || "Sign in failed. Please try again.");
          }
        } else {
          toast({ title: "Success!", description: "You are now signed in." });
          navigate("/");
          return;
        }
      }
    } catch (error: any) {
      setError(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const makeMeAdmin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password first");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) {
        if (signInError.message?.includes("Invalid login credentials")) {
          setError("Invalid email or password.");
        } else if (signInError.message?.includes("Email not confirmed")) {
          setError("Please verify your email first.");
        } else {
          setError(signInError.message);
        }
        setIsLoading(false);
        return;
      }

      if (signInData.user) {
        try {
          await supabase.rpc('assign_admin_role', { user_uuid: signInData.user.id });
        } catch {
          await supabase.from('user_roles').upsert({ user_id: signInData.user.id, role: 'admin' }, { onConflict: 'user_id,role' });
        }

        toast({ title: "Success!", description: "Admin role assigned. Redirecting..." });
        await refreshAdminStatus();
        navigate("/admin");
        return;
      }
    } catch (error: any) {
      setError(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmation = async () => {
    if (!email) {
      setError("Please enter your email first");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        setError(error.message);
      } else {
        toast({ title: "Email Sent!", description: "Check your inbox for the verification link." });
      }
    } catch (error: any) {
      setError(error?.message || "Failed to resend email");
    } finally {
      setIsLoading(false);
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
    <main className="pt-24 pb-16 min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm px-4"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display text-gradient-royal mb-2 font-bold">
            RoyalCart
          </h2>
          <p className="text-xs tracking-[0.3em] uppercase text-royal-gold mb-2">
            {getModeSubtitle()}
          </p>
          <h1 className="text-3xl font-display text-foreground">
            {getModeTitle()}
          </h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded p-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-1 mb-6 bg-secondary rounded p-1 border border-royal-purple/30">
          <button
            onClick={setLoginMode}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs uppercase tracking-wider transition-all ${
              mode === "login" ? "gradient-royal text-white shadow-lg" : "text-muted-foreground hover:text-royal-pink"
            }`}
          >
            <User size={14} />
            Sign In
          </button>
          <button
            onClick={setSignupMode}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs uppercase tracking-wider transition-all ${
              mode === "signup" ? "gradient-royal text-white shadow-lg" : "text-muted-foreground hover:text-royal-pink"
            }`}
          >
            <User size={14} />
            Sign Up
          </button>
          <button
            onClick={setAdminMode}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs uppercase tracking-wider transition-all ${
              mode === "admin" ? "gradient-royal text-white shadow-lg" : "text-muted-foreground hover:text-royal-pink"
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
                disabled={isLoading}
                className="w-full bg-secondary border border-royal-purple/30 rounded px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-royal-pink focus:ring-1 focus:ring-royal-pink transition-all disabled:opacity-50"
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
              disabled={isLoading}
              className="w-full bg-secondary border border-royal-purple/30 rounded px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-royal-pink focus:ring-1 focus:ring-royal-pink transition-all disabled:opacity-50"
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
              disabled={isLoading}
              className="w-full bg-secondary border border-royal-purple/30 rounded px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-royal-pink focus:ring-1 focus:ring-royal-pink transition-all disabled:opacity-50"
            />
          </div>

          {mode === "admin" && (
            <div className="bg-royal-purple/10 border border-royal-purple/30 rounded p-3">
              <p className="text-xs text-royal-pink">
                <Shield size={14} className="inline mr-1" />
                Admin accounts have full access to manage products, orders, and customers.
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-royal text-white font-body text-xs tracking-[0.15em] uppercase h-12 hover:shadow-lg hover:shadow-royal-purple/30 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Please wait...
              </>
            ) : (
              mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Create Admin Account"
            )}
          </Button>
        </form>

        {mode === "login" && (
          <div className="mt-4 text-center">
            <button
              onClick={resendConfirmation}
              disabled={isLoading}
              className="text-xs text-muted-foreground hover:text-royal-pink transition-colors"
            >
              Didn't receive verification email? Resend
            </button>
          </div>
        )}

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-muted-foreground hover:text-royal-pink transition-colors">
            Back to Store
          </Link>
        </div>

        {mode === "login" && (
          <div className="text-center mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Settings size={14} className="text-royal-gold" />
              <p className="text-xs text-muted-foreground">Already have an account?</p>
            </div>
            <Button
              onClick={makeMeAdmin}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-xs border-royal-purple text-royal-pink hover:bg-royal-purple hover:text-white"
            >
              {isLoading ? (
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
