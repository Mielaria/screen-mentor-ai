import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bot, Mail, Lock, User, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

type View = "landing" | "login" | "register" | "forgot";

export default function Auth() {
  const [view, setView] = useState<View>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setError("");
    setInfo("");
    setForgotSent(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Debes verificar tu correo electrónico antes de iniciar sesión.");
      } else if (error.message.includes("Invalid login credentials")) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError(error.message);
      }
    } else if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      setError("Debes verificar tu correo electrónico antes de iniciar sesión.");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (!fullName.trim()) {
      setError("El nombre completo es obligatorio.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setInfo("Cuenta creada correctamente. Revisa tu correo electrónico para verificar tu cuenta.");
      setTimeout(() => {
        resetForm();
        setView("login");
      }, 3000);
    }
    setLoading(false);
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://screen-mentor-ai.lovable.app/reset-password",
    });

    if (error) {
      setError(error.message);
    } else {
      setForgotSent(true);
      setInfo("Te enviamos un enlace a tu correo. Ábrelo para cambiar tu contraseña.");
    }
    setLoading(false);
  };

  if (view === "landing") {
    return (
      <div className="dark flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="text-center max-w-md w-full space-y-8">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
              <Bot className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="text-foreground">Screen</span>
              <span className="text-primary">Mentor</span>
              <span className="text-foreground"> AI</span>
            </h1>
            <p className="mt-3 text-muted-foreground">Tu mentor digital en tiempo real</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => { resetForm(); setView("login"); }}
              className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:bg-primary/90"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { resetForm(); setView("register"); }}
              className="w-full rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:scale-[1.02] hover:bg-accent"
            >
              Registrarse
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "forgot") {
    return (
      <div className="dark flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6">
          <button
            onClick={() => { resetForm(); setView("login"); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </button>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Recuperar contraseña</h2>
            <p className="text-sm text-muted-foreground">
              {forgotSent
                ? "Revisa tu correo y toca el enlace para cambiar tu contraseña."
                : "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña."}
            </p>
          </div>

          {!forgotSent ? (
            <form onSubmit={handleSendResetLink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar enlace
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
              {info && <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm text-primary">{info}</div>}
              <p className="text-center text-xs text-muted-foreground">
                Al abrir el enlace llegarás a una página para escribir tu nueva contraseña.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isLogin = view === "login";

  return (
    <div className="dark flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <button
          onClick={() => { resetForm(); setView("landing"); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{isLogin ? "Iniciar sesión" : "Crear cuenta"}</h2>
          <p className="text-sm text-muted-foreground">{isLogin ? "Ingresa tus credenciales" : "Completa tus datos para registrarte"}</p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tu nombre"
                  className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" required />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com"
                className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <button type="button" onClick={() => { resetForm(); setView("forgot"); }}
                className="text-xs font-medium text-primary hover:underline">
                Se me olvidó la contraseña
              </button>
            </div>
          )}

          {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
          {info && <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{info}</div>}

          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? "Ingresar" : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button onClick={() => { resetForm(); setView(isLogin ? "register" : "login"); }}
            className="font-medium text-primary hover:underline">
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
