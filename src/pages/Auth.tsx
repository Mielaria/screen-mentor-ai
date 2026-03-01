import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Mail, Lock, User, ArrowLeft, Loader2, RefreshCw, ShieldCheck } from "lucide-react";

type View = "landing" | "login" | "register" | "verify-otp";

export default function Auth() {
  const [view, setView] = useState<View>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setError("");
    setInfo("");
    setOtpDigits(["", "", "", "", "", ""]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Debes verificar tu correo electrónico antes de iniciar sesión.");
      } else if (error.message.includes("Invalid login credentials")) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError(error.message);
      }
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
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setOtpDigits(["", "", "", "", "", ""]);
      setView("verify-otp");
      setInfo("Hemos enviado un código de 6 dígitos a tu correo. Ingrésalo a continuación.");
    }
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setOtpDigits(newDigits);
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    const token = otpDigits.join("");
    if (token.length !== 6) {
      setError("Ingresa los 6 dígitos del código.");
      return;
    }

    setError("");
    setInfo("");
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) {
      setError("Código incorrecto o expirado. Intenta de nuevo.");
    }
    setLoading(false);
  };

  const handleResendCode = async () => {
    setError("");
    setInfo("");
    setLoading(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      setError("No se pudo reenviar el código. Intenta más tarde.");
    } else {
      setInfo("Código reenviado. Revisa tu bandeja de entrada.");
    }
    setLoading(false);
  };

  // Landing view
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
            <p className="mt-3 text-muted-foreground">Tu mentor digital en tiempo real</p>
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

  // OTP verification view
  if (view === "verify-otp") {
    return (
      <div className="dark flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6">
          <button
            onClick={() => { resetForm(); setView("register"); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Verifica tu correo</h2>
            <p className="text-sm text-muted-foreground">
              Ingresa el código de 6 dígitos enviado a <span className="text-foreground font-medium">{email}</span>
            </p>
          </div>

          <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-12 h-14 rounded-xl border border-border bg-card text-center text-xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            ))}
          </div>

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
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verificar código
          </button>

          <button
            onClick={handleResendCode}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reenviar código
          </button>
        </div>
      </div>
    );
  }

  // Login / Register view
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
