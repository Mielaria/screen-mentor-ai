import { cn } from "@/lib/utils";

const LEVELS = [
  { id: "basico", label: "Básico", color: "text-blue-400", dot: "bg-blue-400" },
  { id: "intermedio", label: "Intermedio", color: "text-yellow-400", dot: "bg-yellow-400" },
  { id: "avanzado", label: "Avanzado", color: "text-red-400", dot: "bg-red-400" },
] as const;

interface LevelSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function LevelSelector({ selected, onSelect }: LevelSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Nivel
      </span>
      <div className="grid grid-cols-3 gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-all duration-200",
              selected === level.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50 hover:bg-accent"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", level.dot)} />
            <span className={selected === level.id ? level.color : "text-muted-foreground"}>
              {level.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
