import { cn } from "@/lib/utils";

const SOFTWARE_OPTIONS = [
  { id: "photoshop", label: "Photoshop", icon: "🎨" },
  { id: "canva", label: "Canva", icon: "🖼️" },
  { id: "shapr3d", label: "Shapr3D", icon: "📐" },
] as const;

interface SoftwareSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function SoftwareSelector({ selected, onSelect }: SoftwareSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Software
      </span>
      <div className="grid grid-cols-3 gap-2">
        {SOFTWARE_OPTIONS.map((sw) => (
          <button
            key={sw.id}
            onClick={() => onSelect(sw.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border p-3 text-xs font-medium transition-all duration-200",
              selected === sw.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-accent"
            )}
          >
            <span className="text-lg">{sw.icon}</span>
            {sw.label}
          </button>
        ))}
      </div>
    </div>
  );
}
