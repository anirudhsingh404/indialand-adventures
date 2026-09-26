import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/india-land-hero.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — India Land" },
      { name: "description", content: "Sign in or create your India Land account to plan trips across India." },
      { property: "og:title", content: "Sign in — India Land" },
      { property: "og:description", content: "Sign in or create your India Land account to plan trips across India." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/", replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (mode === "signup") setSent(true);
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message ?? "Google sign-in failed");
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-4 text-ink">
      <img src={heroImage} alt="" className="animate-slow-drift absolute inset-0 size-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 to-ink/80" />
      <div className="animate-scale-in relative w-full max-w-md rounded-xl border border-cream/30 bg-cream/85 p-7 shadow-2xl backdrop-blur-xl">
        <Link to="/" className="font-display text-xl font-semibold">INDIA <span className="text-terracotta">LAND</span></Link>
        <h1 className="mt-5 font-display text-3xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to see live places, weather and directions.</p>
        {sent ? (
          <p className="mt-6 rounded-md bg-sand/60 p-4 text-sm">Check your email to confirm your account, then sign in.</p>
        ) : (
          <>
            <Button variant="outline" className="mt-6 w-full" onClick={google}>Continue with Google</Button>
            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
            <form onSubmit={submit} className="grid gap-3">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-12 rounded-md border border-border bg-cream px-4 outline-none focus:border-terracotta" />
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="h-12 rounded-md border border-border bg-cream px-4 outline-none focus:border-terracotta" />
              <Button type="submit" disabled={busy} className="h-12">{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}</Button>
            </form>
          </>
        )}
        <button className="mt-5 text-sm font-semibold text-terracotta" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setSent(false); }}>
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
