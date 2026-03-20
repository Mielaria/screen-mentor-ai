import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

import photoshopLogo from "@/assets/logos/photoshop.png";
import canvaLogo from "@/assets/logos/canva.png";
import shapr3dLogo from "@/assets/logos/shapr3d.png";
import blenderLogo from "@/assets/logos/blender.png";
import illustratorLogo from "@/assets/logos/illustrator.png";
import capcutLogo from "@/assets/logos/capcut.png";

export interface SoftwareOption {
  id: string;
  label: string;
  logo: string;
  logoClassName?: string;
}

const SOFTWARE_OPTIONS: SoftwareOption[] = [
  { id: "photoshop", label: "Photoshop", logo: photoshopLogo },
  { id: "canva", label: "Canva", logo: canvaLogo },
  { id: "shapr3d", label: "Shapr3D", logo: shapr3dLogo, logoClassName: "max-h-12 max-w-12" },
  { id: "blender", label: "Blender 3D", logo: blenderLogo },
  { id: "illustrator", label: "Illustrator", logo: illustratorLogo, logoClassName: "max-h-[65px] max-w-[65px]" },
  {
    id: "capcut",
    label: "CapCut",
    logo: capcutLogo,
    logoClassName: "max-h-10 max-w-10",
  },
];

interface SoftwareSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function SoftwareSelector({ selected, onSelect }: SoftwareSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedSoftware = SOFTWARE_OPTIONS.find((s) => s.id === selected);

  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2 shrink-0">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Software
      </span>

      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-accent/50 px-3 py-2.5 text-xs font-medium text-foreground transition-all hover:border-primary/40"
      >
        {selectedSoftware ? (
          <>
            <img
              src={selectedSoftware.logo}
              alt={selectedSoftware.label}
              className="h-5 w-5 rounded object-contain"
            />
            <span className="flex-1 text-left">{selectedSoftware.label}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-muted-foreground">Seleccionar software</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Seleccionar software</span>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto p-4">
              {SOFTWARE_OPTIONS.map((sw) => (
                <button
                  key={sw.id}
                  onClick={() => handleSelect(sw.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200",
                    selected === sw.id
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border bg-accent/30 hover:border-primary/40 hover:bg-accent/60"
                  )}
                >
                  <div className="flex h-32 w-32 items-center justify-center">
                    <img
                      src={sw.logo}
                      alt={sw.label}
                      className={cn(
                        "rounded-lg object-contain max-h-20 max-w-20",
                        sw.logoClassName
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      selected === sw.id ? "text-primary" : "text-foreground"
                    )}
                  >
                    {sw.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
