import { useState, useEffect, useCallback, useRef } from "react";
import { Monitor, MonitorOff, Mic, X, Minus, GripHorizontal, SkipForward, RotateCcw, Square, Upload, ImageIcon, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { useScreenCapture } from "@/hooks/useScreenCapture";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useTTS } from "@/hooks/useTTS";
import { useDraggable } from "@/hooks/useDraggable";
import { useResizable } from "@/hooks/useResizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { SoftwareSelector } from "./SoftwareSelector";
import { LevelSelector } from "./LevelSelector";
import { ResponseArea } from "./ResponseArea";
import { cn } from "@/lib/utils";

interface CopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

export function CopilotPanel({ isOpen, onClose, onMinimize }: CopilotPanelProps) {
  
  const [software, setSoftware] = useState("photoshop");
  const [level, setLevel] = useState("basico");
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { isSharing, hasManualCapture, startCapture, stopCapture, captureSnapshot, setManualCapture, clearManualCapture } = useScreenCapture();
  const { isListening, transcript, startListening, stopListening, clearTranscript } = useVoiceInput();
  const { speak, stop: stopTTS } = useTTS();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { position, onMouseDown, onTouchStart } = useDraggable({
    x: isMobile ? 10 : Math.max(40, window.innerWidth - 400),
    y: isMobile ? 10 : 40,
  });
  const { size, onResizeStart, onResizeTouchStart } = useResizable(
    isMobile ? { width: Math.min(320, window.innerWidth - 20), height: 480 } : { width: 340, height: 520 },
    { width: 340, height: 520 },
    { width: 280, height: 360 },
    { width: 600, height: 800 }
  );

  const speakStep = useCallback((text: string) => {
    stopTTS();
    setIsSpeaking(true);
    speak(text);
    const checkInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setIsSpeaking(false);
        clearInterval(checkInterval);
      }
    }, 300);
  }, [speak, stopTTS]);

  useEffect(() => {
    if (transcript && !isListening) {
      handleQuery(transcript);
    }
  }, [transcript, isListening]);

  const handleQuery = async (text: string) => {
    setIsLoading(true);
    setSteps([]);
    setCurrentStep(0);
    stopTTS();
    setIsSpeaking(false);

    const image_base64 = captureSnapshot();

    try {
      const { data, error } = await supabase.functions.invoke("screen-mentor", {
        body: {
          image_base64,
          texto_transcrito: text,
          nivel_usuario: level,
          software_seleccionado: software,
        },
      });

      if (error) throw error;

      const rawSteps = data?.steps || "No se pudo generar una respuesta.";
      const parsed: string[] = typeof rawSteps === "string"
        ? rawSteps.split("\n").filter((l: string) => l.trim())
        : Array.isArray(rawSteps) ? rawSteps : [String(rawSteps)];

      setSteps(parsed);
      setCurrentStep(0);
      clearTranscript();

      if (parsed.length > 0) {
        speakStep(parsed[0]);
      }
    } catch (err: any) {
      console.error("Query error:", err);
      setSteps(["Error: No se pudo procesar tu solicitud. Intenta de nuevo."]);
      setCurrentStep(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    const next = currentStep + 1;
    if (next < steps.length) {
      setCurrentStep(next);
      speakStep(steps[next]);
    }
  };

  const handleRepeatStep = () => {
    if (steps.length > 0) {
      speakStep(steps[currentStep]);
    }
  };

  const handleStopReading = () => {
    stopTTS();
    setIsSpeaking(false);
  };

  const handleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (base64) {
        setManualCapture(base64);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }, [setManualCapture]);

  if (!isOpen) return null;

  const isLastStep = currentStep >= steps.length - 1;
  const hasSteps = steps.length > 0;

  return (
    <div
      className="fixed z-[9999] flex flex-col rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        className="flex items-center justify-between border-b border-border px-3 py-2.5 bg-card/80 cursor-grab active:cursor-grabbing select-none shrink-0 touch-none"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-foreground tracking-wide">ScreenMentor</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onMinimize}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Minimizar"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
            title="Cerrar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-3 min-h-0">
        {/* Screen capture: desktop vs mobile */}
        {isMobile ? (
          <div className="space-y-2 shrink-0">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-accent/30 px-3 py-2 text-[10px] text-muted-foreground">
              <Smartphone className="h-3.5 w-3.5 shrink-0" />
              En dispositivos móviles no es posible compartir pantalla desde el navegador. Por favor, sube una captura manualmente.
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all w-full",
                hasManualCapture
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {hasManualCapture ? <ImageIcon className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
              {hasManualCapture ? "Captura cargada" : "Subir captura"}
            </button>
            {hasManualCapture && (
              <button
                onClick={clearManualCapture}
                className="w-full text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Eliminar captura
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={isSharing ? stopCapture : startCapture}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all w-full shrink-0",
              isSharing
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isSharing ? <Monitor className="h-3.5 w-3.5" /> : <MonitorOff className="h-3.5 w-3.5" />}
            {isSharing ? "Pantalla compartida" : "Compartir pantalla"}
          </button>
        )}

        <SoftwareSelector selected={software} onSelect={setSoftware} />
        <LevelSelector selected={level} onSelect={setLevel} />

        {/* Transcript preview */}
        {transcript && (
          <div className="rounded-xl border border-border bg-accent/50 p-2.5 shrink-0">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Tu consulta</span>
            <p className="mt-0.5 text-xs text-foreground">{transcript}</p>
          </div>
        )}

        <ResponseArea steps={steps} currentStep={currentStep} isLoading={isLoading} />
      </div>

      {/* Step controls — fixed above footer */}
      {hasSteps && !isLoading && (
        <div className="flex items-center gap-1.5 shrink-0 border-t border-border px-3 py-2">
          <button
            onClick={handleRepeatStep}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-card py-2 text-[10px] font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Repetir
          </button>
          <button
            onClick={handleStopReading}
            disabled={!isSpeaking}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-card py-2 text-[10px] font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground",
              !isSpeaking && "opacity-40 cursor-not-allowed"
            )}
          >
            <Square className="h-3 w-3" />
            Detener
          </button>
          <button
            onClick={handleNextStep}
            disabled={isLastStep}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary py-2 text-[10px] font-semibold text-primary-foreground transition-all hover:bg-primary/90",
              isLastStep && "opacity-40 cursor-not-allowed"
            )}
          >
            <SkipForward className="h-3 w-3" />
            Siguiente
          </button>
        </div>
      )}

      {/* Footer — Mic button */}
      <div className="flex items-center gap-2 border-t border-border px-3 py-2.5 shrink-0">
        <button
          onClick={handleMic}
          disabled={isLoading}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all",
            isListening
              ? "animate-pulse bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          <Mic className="h-3.5 w-3.5" />
          Consultar
        </button>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onResizeStart}
        onTouchStart={onResizeTouchStart}
        className="absolute bottom-0 right-0 h-8 w-8 cursor-se-resize flex items-end justify-end pr-1 pb-1 touch-none"
        title="Redimensionar"
      >
        <svg width="12" height="12" viewBox="0 0 10 10" className="text-muted-foreground/50">
          <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
