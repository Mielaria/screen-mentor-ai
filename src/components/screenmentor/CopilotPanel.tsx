import { useState, useEffect, useCallback } from "react";
import { Monitor, MonitorOff, Mic, X, Minus, GripHorizontal, SkipForward, RotateCcw, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useScreenCapture } from "@/hooks/useScreenCapture";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useTTS } from "@/hooks/useTTS";
import { SoftwareSelector } from "./SoftwareSelector";
import { LevelSelector } from "./LevelSelector";
import { ResponseArea } from "./ResponseArea";
import { cn } from "@/lib/utils";

interface CopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CopilotPanel({ isOpen, onClose }: CopilotPanelProps) {
  const [software, setSoftware] = useState("photoshop");
  const [level, setLevel] = useState("basico");
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const { isSharing, startCapture, stopCapture, captureSnapshot } = useScreenCapture();
  const { isListening, transcript, startListening, stopListening, clearTranscript } = useVoiceInput();
  const { speak, stop: stopTTS } = useTTS();

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

      // Auto-read first step only
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

  if (!isOpen) return null;

  const isLastStep = currentStep >= steps.length - 1;
  const hasSteps = steps.length > 0;

  return (
    <div
      className={cn(
        "fixed right-4 top-4 bottom-4 z-40 flex w-[340px] flex-col rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 ease-in-out overflow-hidden",
        isMinimized && "bottom-auto"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card">
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-sm font-semibold text-foreground">ScreenMentor</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Body */}
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
            {/* Screen share */}
            <button
              onClick={isSharing ? stopCapture : startCapture}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all w-full",
                isSharing
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isSharing ? <Monitor className="h-4 w-4" /> : <MonitorOff className="h-4 w-4" />}
              {isSharing ? "Pantalla compartida" : "Compartir pantalla"}
            </button>

            <SoftwareSelector selected={software} onSelect={setSoftware} />
            <LevelSelector selected={level} onSelect={setLevel} />

            {/* Transcript preview */}
            {transcript && (
              <div className="rounded-xl border border-border bg-accent/50 p-3">
                <span className="text-xs text-muted-foreground">Tu consulta:</span>
                <p className="mt-1 text-sm text-foreground">{transcript}</p>
              </div>
            )}

            <ResponseArea steps={steps} currentStep={currentStep} isLoading={isLoading} />

            {/* Step controls */}
            {hasSteps && !isLoading && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRepeatStep}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Repetir
                </button>
                <button
                  onClick={handleStopReading}
                  disabled={!isSpeaking}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground",
                    !isSpeaking && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <Square className="h-3.5 w-3.5" />
                  Detener
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={isLastStep}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90",
                    isLastStep && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  Siguiente
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 border-t border-border px-4 py-3">
            <button
              onClick={handleMic}
              disabled={isLoading}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all",
                isListening
                  ? "animate-pulse bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Mic className="h-4 w-4" />
              Consultar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
