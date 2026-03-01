import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponseAreaProps {
  steps: string[];
  currentStep: number;
  isLoading: boolean;
}

export function ResponseArea({ steps, currentStep, isLoading }: ResponseAreaProps) {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = stepRefs.current[currentStep];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep, steps]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="animate-pulse text-sm font-medium text-muted-foreground">
          Analizando pantalla…
        </span>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <span className="text-3xl">🎯</span>
        <p className="text-sm text-muted-foreground">
          Comparte tu pantalla, selecciona el software y nivel, luego usa el micrófono para hacer tu consulta.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pr-1">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Instrucciones
      </span>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={i}
            ref={(el) => { stepRefs.current[i] = el; }}
            className={cn(
              "rounded-lg border p-3 text-sm leading-relaxed transition-all duration-500 ease-in-out",
              i === currentStep
                ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/40 shadow-md shadow-primary/10 scale-[1.01] border-l-4 border-l-primary"
                : i < currentStep
                  ? "border-border bg-muted/30 text-muted-foreground"
                  : "border-border bg-card text-muted-foreground opacity-50"
            )}
          >
            <span className={cn(
              "mr-2 font-semibold transition-colors duration-300",
              i === currentStep ? "text-primary" : "text-muted-foreground"
            )}>
              {i + 1}.
            </span>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
