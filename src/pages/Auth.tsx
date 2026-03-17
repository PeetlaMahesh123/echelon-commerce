import { useState, memo, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, User, Settings, CheckCircle } from "lucide-react";

type AuthMode = "login" | "signup" | "admin";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const { signIn, signUp, refreshAdminStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check for email confirmation on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.email_confirmed_at) {
        setEmailConfirmed(true);
      }
    };
    checkSession();
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), []);
  const setLoginMode = useCallback(() => setMode("login"), []);
  const setSignupMode = useCallback(() => setMode("signup"), []);
  const setAdminMode = useCallback(() => setMode("admin"), []);

  const handleAdminSignup = async () => {
    if (!email || !password || !name) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
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
        toast({ title: "Error", description: signUpError.message, variant: "destructive" });
        return false;
      }

      if (signUpData.user) {
        // Try to assign admin role
        try {
          await supabase.rpc('assign_admin_role', { user_uuid: signUpData.user.id });
        } catch {
          await supabase.from('user_roles').insert({ user_id: signUpData.user.id, role: 'admin' });
        }
        
        toast({ 
          title: "Admin Account Created!", 
          description: "Please check your email and click the verification link to activate your account." 
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to create account", variant: "destructive" });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);

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
            toast({ title: "Account Exists", description: "An account with this email already exists. Please sign in.", variant: "destructive" });
          } else {
            toast({ title: "Error", description: error.message, variant: "destructive" });
          }
        } else if (data.user?.identities?.length === 0) {
          toast({ title: "Account Exists", description: "An account with this email already exists. Please sign in.", variant: "destructive" });
        } else {
          toast({ 
            title: "Account Created!", 
            description: "Please check your email and click the verification link to activate your account." 
          });
          setMode("login");
        }
      } else {
        // Login mode - use direct Supabase call for better error handling
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          const errorMsg = error.message || "";
          if (errorMsg.includes("Invalid login credentials")) {
            toast({ title: "Account Not Found", description: "No account exists with this email. Please sign up first.", variant: "destructive" });
          } else if (errorMsg.includes("Email not confirmed")) {
            toast({ 
              title: "Email Not Verified", 
              description: "Please check your email and click the verification link before signing in.", 
              variant: "destructive" 
            });
          } else {
            toast({ title: "Error", description: errorMsg || "Authentication failed. Please try again.", variant: "destructive" });
          }
        } else if (data.user) {
          toast({ title: "Success!", description: "You are now signed in." });
          navigate("/");
          return;
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const makeMeAdmin = async () => {
    if (!email || !password) {
      toast({ title: "Error", description: "Please enter your email and password first", variant: "destructive" });
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) {
        if (signInError.message?.includes("Invalid login credentials")) {
          toast({ title: "Account Not Found", description: "No account exists with this email. Please sign up first.", variant: "destructive" });
        } else if (signInError.message?.includes("Email not confirmed")) {
          toast({ 
            title: "Email Not Verified", 
            description: "Please check your email and click the verification link before signing in.", 
            variant: "destructive" 
          });
        } else {
          toast({ title: "Error", description: signInError.message, variant: "destructive" });
        }
        setIsLoading(false);
        return;
      }

      if (signInData.user) {
        // Assign admin role
        try {
          await supabase.rpc('assign_admin_role', { user_uuid: signInData.user.id });
        } catch {
          await supabase.from('user_roles').upsert({ user_id: signInData.user.id, role: 'admin' }, { onConflict: 'user_id,role' });
        }

        toast({ title: "Success!", description: "Admin role assigned. Redirecting to admin panel..." });
        await refreshAdminStatus();
        navigate("/admin");
        return;
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmation = async () => {
    if (!email) {
      toast({ title: "Error", description: "Please enter your email first", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Email Sent!", description: "Check your inbox for the verification link." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to resend email", variant: "destructive" });
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

        {emailConfirmed && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded p-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <p className="text-xs text-green-500">Email verified! You can now sign in.</p>
          </div>
        )}

        <div className="flex gap-1 mb-6 bg-secondary rounded p-1">
          <button
            onClick={setLoginMode}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs uppercase tracking-wider transition-colors ${
              mode === "login" ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={14} />
            Sign In
          </button>
          <button
            onClick={setSignupMode}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs uppercase tracking-wider transition-colors ${
              mode === "signup" ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={14} />
            Sign Up
          </button>
          <button
            onClick={setAdminMode}
            disabled={isLoading}
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
                disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
            disabled={isLoading}
            className="w-full gradient-gold text-primary-foreground font-body text-xs tracking-[0.15em] uppercase h-12"
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
              className="text-xs text-muted-foreground hover:text-gold transition-colors"
            >
              Didn't receive verification email? Resend
            </button>
          </div>
        )}

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-muted-foreground hover:text-gold transition-colors">
            Back to Store
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
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-xs border-gold text-gold hover:bg-gold hover:text-primary-foreground"
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
