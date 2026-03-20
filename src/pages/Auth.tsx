import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Mail, Lock, User, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

type View = "landing" | "login" | "register" | "forgot" | "newpass";
type ForgotStep = "email" | "sent";

export default function Auth() {
  const [view, setView] = useState<View>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Listen for PASSWORD_RECOVERY event (when user clicks link in email)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setView("newpass");
        setError("");
        setInfo("");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setError("");
    setInfo("");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotStep("email");
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

  // Forgot password handlers
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setError(error.message);
    } else {
      setInfo("Se envió un código de verificación a tu correo electrónico.");
      setForgotStep("code");
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "recovery",
    });

    if (error) {
      setError("Código inválido o expirado. Intenta de nuevo.");
    } else {
      setInfo("Código verificado. Ingresa tu nueva contraseña.");
      setForgotStep("newpass");
    }
    setLoading(false);
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setError(error.message);
    } else {
      await supabase.auth.signOut();
      setInfo("Contraseña actualizada correctamente. Ahora puedes iniciar sesión.");
      setTimeout(() => {
        resetForm();
        setView("login");
      }, 3000);
    }
    setLoading(false);
  };

  if (view === "landing") {
    return (
      <div className="dark flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="text-center space-y-8 max-w-md w-full">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="h-10 w-10 text-primary" />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="text-foreground">Screen</span>
              <span className="text-primary">Mentor</span>
              <span className="text-foreground"> AI</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              Tu mentor digital en tiempo real
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => { resetForm(); setView("login"); }}
              className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02]"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { resetForm(); setView("register"); }}
              className="w-full rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:scale-[1.02]"
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
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </button>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Recuperar contraseña</h2>
            <p className="text-sm text-muted-foreground">
              {forgotStep === "email" && "Ingresa tu correo para recibir un código de verificación."}
              {forgotStep === "code" && "Ingresa el código que recibiste en tu correo."}
              {forgotStep === "newpass" && "Establece tu nueva contraseña."}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2">
            {(["email", "code", "newpass"] as ForgotStep[]).map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full transition-colors ${
                  forgotStep === step ? "bg-primary" :
                  (["email", "code", "newpass"].indexOf(forgotStep) > i ? "bg-primary/50" : "bg-muted")
                }`} />
                {i < 2 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>

          {forgotStep === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar código
              </button>
            </form>
          )}

          {forgotStep === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Código de verificación</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Ingresa el código"
                    className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 tracking-widest"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
              )}
              {info && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{info}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verificar código
              </button>
            </form>
          )}

          {forgotStep === "newpass" && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nueva contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
              )}
              {info && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{info}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Cambiar contraseña
              </button>
            </form>
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
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Ingresa tus credenciales" : "Completa tus datos para registrarte"}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                minLength={6}
              />
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => { resetForm(); setView("forgot"); }}
                className="text-xs text-green-500 hover:underline"
              >
                Se me olvidó la contraseña
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {info && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? "Ingresar" : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => { resetForm(); setView(isLogin ? "register" : "login"); }}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
