import { useEffect, useState } from "react";
import { ScreenMentor } from "@/components/screenmentor/ScreenMentor";
import { Monitor, Mic, Bot } from "lucide-react";
import { FeedbackSection } from "@/components/FeedbackSection";
import { UserProfileMenu } from "@/components/screenmentor/UserProfileMenu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const greetings = [
  (name: string) => `Bienvenido, ${name}.`,
  (name: string) => `Hola, ${name}. Listo para trabajar.`,
  (name: string) => `Bienvenido de nuevo, ${name}.`,
  (name: string) => `Hola, ${name}. ¿Cómo te puedo ayudar hoy?`,
];

const Index = () => {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();
      const name = data?.full_name || user.user_metadata?.full_name || "Usuario";
      setFullName(name);
      setGreeting(greetings[Math.floor(Math.random() * greetings.length)](name));
    };
    fetchProfile();
  }, [user]);

  return (
    <div className="dark min-h-screen bg-background">
      {/* Top bar with profile */}
      <div className="fixed top-4 left-4 z-50">
        <UserProfileMenu />
      </div>

      {/* Hero */}
      <section className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl">
          {greeting && (
            <p className="text-xl md:text-2xl font-semibold text-foreground animate-fade-in">
              {greeting}
            </p>
          )}

          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary">
              <Bot className="h-4 w-4" />
              Demo MVP — Photoshop · Canva · Shapr3D
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="text-foreground">Screen</span>
            <span className="text-primary">Mentor</span>
            <span className="text-foreground"> AI</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Tu mentor digital en tiempo real. Comparte pantalla, habla y recibe instrucciones paso a paso adaptadas a tu nivel.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground">
              <Monitor className="h-4 w-4 text-primary" />
              Comparte pantalla
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground">
              <Mic className="h-4 w-4 text-primary" />
              Consulta por voz
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground">
              <Bot className="h-4 w-4 text-primary" />
              IA contextual
            </span>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                const btn = document.querySelector('[aria-label="Abrir asistente"]') as HTMLButtonElement;
                btn?.click();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
            >
              <Bot className="h-5 w-5" />
              Iniciar ScreenMentor
            </button>
          </div>

          {/* Compatibility indicator */}
          <div className="mx-auto max-w-xs rounded-xl border border-border bg-card/60 px-6 py-4 text-center backdrop-blur-sm">
            <div className="flex justify-center gap-5 mb-3">
              {/* Windows icon */}
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-muted-foreground" fill="currentColor">
                <path d="M3 12V6.75l7-1.05V12H3zm8-1.35V5.55l10-1.55V12H11V10.65zM3 13h7v6.3l-7-1.05V13zm8 0h10v7l-10-1.55V13z"/>
              </svg>
              {/* Android icon */}
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-muted-foreground" fill="currentColor">
                <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0012 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.983 5.983 0 006 7h12c0-2.12-1.1-3.98-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">Optimizado para Windows y Android</p>
            <p className="mt-1 text-xs text-muted-foreground">En dispositivos iPhone algunas funciones pueden presentar limitaciones.</p>
          </div>
        </div>
      </section>

      {/* Feedback */}
      <FeedbackSection userName={fullName} />

      {/* Info section */}
      <section className="border-t border-border bg-card/50 px-4 py-20">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            ¿Para quién es ScreenMentor?
          </h2>
          <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              ScreenMentor está diseñado para acompañar a personas que quieren aprender a usar herramientas digitales de forma clara, guiada y sin frustración.
            </p>
            <p>
              Está pensado especialmente para jóvenes que están dando sus primeros pasos en el mundo de la tecnología y desean aprender a manejar programas como Photoshop, Canva o herramientas de diseño 3D con mayor confianza.
            </p>
            <p>
              También está dirigido a adultos que desean mejorar sus habilidades digitales pero encuentran complejos algunos programas o procesos técnicos. ScreenMentor ofrece explicaciones paso a paso, adaptadas al nivel de cada persona, para que cualquier usuario pueda avanzar sin sentirse perdido.
            </p>
            <p className="text-foreground font-medium">
              Nuestro objetivo es hacer que la tecnología sea más accesible, más humana y más fácil de entender para todos.
            </p>
          </div>
        </div>
      </section>

      <ScreenMentor />
    </div>
  );
};

export default Index;
