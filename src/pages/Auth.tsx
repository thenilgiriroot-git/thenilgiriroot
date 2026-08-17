import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Set up listener BEFORE checking session (per auth best practices)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
      setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const signInWith = async (provider: "google" | "apple") => {
    setLoading(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Sign-in failed. Please try again.");
        setLoading(null);
        return;
      }
      if (result.redirected) return;
      navigate("/", { replace: true });
    } catch {
      toast.error("Something went wrong.");
      setLoading(null);
    }
  };

  return (
    <main className="pt-24 pb-20 min-h-screen flex items-center">
      <SEOHead
        title="Sign in — The Nilgiri Root"
        description="Sign in to The Nilgiri Root to access your account."
        noIndex
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-accent/10 text-accent mb-4">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Welcome
          </h1>
          <p className="font-body text-muted-foreground text-sm">
            Sign in to continue to The Nilgiri Root.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6">
          {checking ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => signInWith("google")}
                disabled={loading !== null}
                className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 rounded-full border border-border bg-background hover:bg-muted text-foreground font-body text-sm font-medium transition-colors disabled:opacity-60"
              >
                {loading === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => signInWith("apple")}
                disabled={loading !== null}
                className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 rounded-full bg-foreground text-background hover:bg-foreground/90 font-body text-sm font-medium transition-colors disabled:opacity-60"
              >
                {loading === "apple" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AppleIcon />
                )}
                Continue with Apple
              </button>
            </div>
          )}
          <p className="mt-4 text-center font-body text-xs text-muted-foreground">
            By continuing you agree to our terms and privacy policy.
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.7 35.5 44 30.1 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}
