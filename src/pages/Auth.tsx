import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/store/useAuth";
import { Dumbbell, ArrowRight, Lock, Mail, Loader2, Sparkles } from "lucide-react";
import { lovable } from "@/integrations/lovable";

type AuthView = "login" | "register" | "recovery";

/* ---------- Aurora background (pure CSS, no libs) ---------- */
const AuroraBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* Subtle grid for depth */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }}
    />
    {/* Drifting glow orbs */}
    <div className="aurora-orb-1 absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-primary/30 blur-[120px]" />
    <div className="aurora-orb-2 absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-emerald-500/25 blur-[120px]" />
    <div className="aurora-orb-3 absolute bottom-[-180px] left-1/4 h-[460px] w-[460px] rounded-full bg-indigo-500/25 blur-[110px]" />
    <div className="aurora-orb-4 absolute top-10 left-1/2 h-[360px] w-[360px] rounded-full bg-cyan-400/20 blur-[100px]" />
    {/* Soft top-light vignette */}
    <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background/60" />
  </div>
);

/* ---------- Shared Input wrapper with icon + premium focus ring ---------- */
const FieldInput = ({
  icon: Icon,
  ...props
}: React.ComponentProps<"input"> & { icon: typeof Mail }) => (
  <div className="relative group">
    <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors duration-300 group-focus-within:text-primary" />
    <Input
      {...props}
      className="pl-10 h-11 bg-background/40 border-white/10 dark:border-white/5 backdrop-blur-md transition-all duration-300 hover:border-primary/30 focus:ring-2 focus:ring-primary/50 focus:border-primary/40"
    />
  </div>
);

const SubmitButton = ({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) => (
  <Button
    type="submit"
    disabled={loading}
    className="w-full h-11 group relative overflow-hidden gradient-primary text-primary-foreground font-semibold transition-all duration-300 hover:shadow-[0_0_24px_-2px_hsl(var(--primary)/0.55)] active:scale-[0.98]"
  >
    {loading ? (
      <span className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Attendere...
      </span>
    ) : (
      children
    )}
  </Button>
);

const Auth = () => {
  const { session, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<AuthView>(
    searchParams.get("signup") === "true" ? "register" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Accedi · NC Business";
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (session) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Errore di accesso", description: "Credenziali non valide.", variant: "destructive" });
    } else {
      toast({ title: "Bentornato!", description: "Accesso effettuato con successo." });
    }
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      const lower = error.message.toLowerCase();
      const msg = lower.includes("non autorizzata") || lower.includes("not allowed") || lower.includes("unauthorized")
        ? "Email non autorizzata ad accedere a questa piattaforma."
        : lower.includes("already registered")
          ? "Questa email è già registrata. Prova ad accedere."
          : error.message;
      toast({ title: "Errore di registrazione", description: msg, variant: "destructive" });
    } else {
      toast({ title: "Account creato!", description: "Ora puoi accedere." });
      setView("login");
    }
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.redirected) return;
    if (result.error) {
      const msg = result.error.message?.toLowerCase().includes("non autorizzata")
        ? "Email non autorizzata ad accedere a questa piattaforma."
        : result.error.message || "Impossibile completare l'accesso con Google.";
      toast({ title: "Errore di accesso", description: msg, variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email di recupero inviata", description: "Controlla la tua casella per le istruzioni di reset." });
      setView("login");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <AuroraBackground />

      <div className="relative z-10 min-h-screen flex">
        {/* Left brand panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-glow">
              <Dumbbell className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">NC Business</h1>
              <p className="text-xs text-muted-foreground">Centro di Comando</p>
            </div>
          </div>

          <div className="space-y-7 max-w-lg animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/40 backdrop-blur-md px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Sistema operativo per imprenditori del fitness
            </div>
            <h2 className="text-5xl font-bold leading-[1.05] tracking-tight text-foreground">
              Trasforma ogni lead in{" "}
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                ricavo prevedibile.
              </span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Pipeline, clienti e cash flow in un'unica piattaforma costruita per studi di personal training premium.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">© 2026 NC Training Systems. Tutti i diritti riservati.</p>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-6 animate-fade-in">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
                <Dumbbell className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <h1 className="text-lg font-bold text-foreground">NC Business</h1>
            </div>

            {/* Glassmorphism card */}
            <div className="relative rounded-3xl bg-background/60 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl p-7 sm:p-8">
              {view === "recovery" ? (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h2 className="text-2xl font-semibold tracking-tight">Reimposta Password</h2>
                    <p className="text-sm text-muted-foreground">
                      Inserisci la tua email per ricevere un link di reset.
                    </p>
                  </div>
                  <form onSubmit={handleRecovery} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recovery-email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Email
                      </Label>
                      <FieldInput
                        icon={Mail}
                        id="recovery-email"
                        type="email"
                        placeholder="tu@esempio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <SubmitButton loading={isSubmitting}>
                      <span className="flex items-center gap-2">
                        Invia Link di Reset
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </SubmitButton>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground"
                      onClick={() => setView("login")}
                    >
                      Torna al Login
                    </Button>
                  </form>
                </div>
              ) : (
                <Tabs value={view} onValueChange={(v) => setView(v as AuthView)} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-white/10 dark:border-white/5 backdrop-blur-md">
                    <TabsTrigger value="login" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      Accedi
                    </TabsTrigger>
                    <TabsTrigger value="register" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      Registrati
                    </TabsTrigger>
                  </TabsList>

                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={handleGoogleSignIn}
                      className="w-full h-11 bg-background/40 border-white/10 dark:border-white/5 backdrop-blur-md hover:bg-background/60 hover:border-primary/30 transition-all duration-300"
                    >
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continua con Google
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10 dark:border-white/5" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background/60 backdrop-blur-md px-2 text-muted-foreground">oppure</span>
                      </div>
                    </div>
                  </div>

                  <TabsContent value="login" className="space-y-6 mt-0">
                    <div className="space-y-1.5">
                      <h2 className="text-2xl font-semibold tracking-tight">Bentornato</h2>
                      <p className="text-sm text-muted-foreground">
                        Inserisci le tue credenziali per continuare.
                      </p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Email
                        </Label>
                        <FieldInput
                          icon={Mail}
                          id="login-email"
                          type="email"
                          placeholder="tu@esempio.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Password
                          </Label>
                          <button
                            type="button"
                            onClick={() => setView("recovery")}
                            className="text-xs text-primary hover:underline"
                          >
                            Password dimenticata?
                          </button>
                        </div>
                        <FieldInput
                          icon={Lock}
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <SubmitButton loading={isSubmitting}>
                        <span className="flex items-center gap-2">
                          Accedi
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </SubmitButton>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-6 mt-0">
                    <div className="space-y-1.5">
                      <h2 className="text-2xl font-semibold tracking-tight">Crea un account</h2>
                      <p className="text-sm text-muted-foreground">
                        Solo email autorizzate possono registrarsi.
                      </p>
                    </div>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Email
                        </Label>
                        <FieldInput
                          icon={Mail}
                          id="reg-email"
                          type="email"
                          placeholder="tu@esempio.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Password
                        </Label>
                        <FieldInput
                          icon={Lock}
                          id="reg-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={8}
                        />
                        <p className="text-xs text-muted-foreground">Minimo 8 caratteri</p>
                      </div>
                      <SubmitButton loading={isSubmitting}>
                        <span className="flex items-center gap-2">
                          Crea Account
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </SubmitButton>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Procedendo accetti i Termini di Servizio e l'Informativa sulla Privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
