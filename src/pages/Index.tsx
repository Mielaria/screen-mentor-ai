import { ScreenMentor } from "@/components/screenmentor/ScreenMentor";
import { Monitor, Mic, Bot } from "lucide-react";

const Index = () => {
  return (
    <div className="dark flex min-h-screen flex-col items-center justify-center bg-background px-4 relative">
      <div className="text-center space-y-8 max-w-2xl">
        {/* Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary">
            <Bot className="h-4 w-4" />
            Demo MVP — Photoshop · Canva · Shapr3D
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          <span className="text-foreground">Screen</span>
          <span className="text-primary">Mentor</span>
          <span className="text-foreground"> AI</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
          Tu mentor digital en tiempo real. Comparte pantalla, habla y recibe instrucciones paso a paso adaptadas a tu nivel.
        </p>

        {/* Feature pills */}
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

        {/* CTA */}
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
      </div>
      <ScreenMentor />
    </div>
  );
};

export default Index;
