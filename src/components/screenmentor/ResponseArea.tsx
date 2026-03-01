import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponseAreaProps {
  steps: string[];
  currentStep: number;
  isLoading: boolean;
}

export function ResponseArea({ steps, currentStep, isLoading }: ResponseAreaProps) {
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
    <div className="space-y-3 overflow-y-auto pr-1">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Instrucciones
      </span>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              "rounded-lg border p-3 text-sm leading-relaxed transition-all duration-300",
              i === currentStep
                ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                : i < currentStep
                  ? "border-border bg-card text-muted-foreground"
                  : "border-border bg-card text-muted-foreground opacity-60"
            )}
          >
            <span className="mr-2 font-semibold text-primary">{i + 1}.</span>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
