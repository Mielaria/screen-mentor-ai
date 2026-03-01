import { cn } from "@/lib/utils";

const SOFTWARE_OPTIONS = [
  { id: "photoshop", label: "Photoshop" },
  { id: "canva", label: "Canva" },
  { id: "shapr3d", label: "Shapr3D" },
] as const;

interface SoftwareSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function SoftwareSelector({ selected, onSelect }: SoftwareSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Software
      </span>
      <div className="grid grid-cols-3 gap-2">
        {SOFTWARE_OPTIONS.map((sw) => (
          <button
            key={sw.id}
            onClick={() => onSelect(sw.id)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-xs font-medium transition-all duration-200",
              selected === sw.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-accent/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {sw.label}
          </button>
        ))}
      </div>
    </div>
  );
}
