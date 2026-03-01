import { Loader2 } from "lucide-react";

interface ResponseAreaProps {
  response: string | null;
  isLoading: boolean;
}

export function ResponseArea({ response, isLoading }: ResponseAreaProps) {
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

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <span className="text-3xl">🎯</span>
        <p className="text-sm text-muted-foreground">
          Comparte tu pantalla, selecciona el software y nivel, luego usa el micrófono para hacer tu consulta.
        </p>
      </div>
    );
  }

  // Parse numbered steps
  const lines = response.split("\n").filter((l) => l.trim());

  return (
    <div className="space-y-3 overflow-y-auto pr-1">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Instrucciones
      </span>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground"
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
