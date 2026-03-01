import { cn } from "@/lib/utils";

const LEVELS = [
  { id: "basico", label: "Básico", dotClass: "bg-emerald-400" },
  { id: "intermedio", label: "Intermedio", dotClass: "bg-yellow-400" },
  { id: "avanzado", label: "Avanzado", dotClass: "bg-red-400" },
] as const;

interface LevelSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function LevelSelector({ selected, onSelect }: LevelSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Nivel
      </span>
      <div className="grid grid-cols-3 gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all duration-200",
              selected === level.id
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-accent/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <span className={cn("h-2.5 w-2.5 rounded-full", level.dotClass)} />
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}
