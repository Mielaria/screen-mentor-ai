import { useState, useEffect } from "react";
import { Monitor, MonitorOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
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
}

export function CopilotPanel({ isOpen }: CopilotPanelProps) {
  const [software, setSoftware] = useState("photoshop");
  const [level, setLevel] = useState("basico");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { isSharing, startCapture, stopCapture, captureSnapshot } = useScreenCapture();
  const { isListening, transcript, startListening, stopListening, clearTranscript } = useVoiceInput();
  const { speak, stop: stopTTS } = useTTS();

  // When transcript is ready, send the query
  useEffect(() => {
    if (transcript && !isListening) {
      handleQuery(transcript);
    }
  }, [transcript, isListening]);

  const handleQuery = async (text: string) => {
    setIsLoading(true);
    setResponse(null);
    stopTTS();

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

      const stepsText = data?.steps || "No se pudo generar una respuesta.";
      setResponse(stepsText);
      clearTranscript();

      // Auto TTS
      setIsSpeaking(true);
      speak(stepsText);
      // speechSynthesis end detection
      const checkInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          clearInterval(checkInterval);
        }
      }, 500);
    } catch (err: any) {
      console.error("Query error:", err);
      setResponse("Error: No se pudo procesar tu solicitud. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTTS = () => {
    if (isSpeaking) {
      stopTTS();
      setIsSpeaking(false);
    } else if (response) {
      setIsSpeaking(true);
      speak(response);
    }
  };

  const handleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-40 flex h-full w-[380px] flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          SM
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">ScreenMentor AI</h2>
          <p className="text-xs text-muted-foreground">Tu mentor digital</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
        <SoftwareSelector selected={software} onSelect={setSoftware} />
        <LevelSelector selected={level} onSelect={setLevel} />

        {/* Screen share */}
        <button
          onClick={isSharing ? stopCapture : startCapture}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
            isSharing
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-accent"
          )}
        >
          {isSharing ? <Monitor className="h-4 w-4" /> : <MonitorOff className="h-4 w-4" />}
          {isSharing ? "Pantalla compartida" : "Compartir Pantalla"}
        </button>

        {/* Transcript preview */}
        {transcript && (
          <div className="rounded-lg border border-border bg-card p-3">
            <span className="text-xs text-muted-foreground">Tu consulta:</span>
            <p className="mt-1 text-sm text-foreground">{transcript}</p>
          </div>
        )}

        <ResponseArea response={response} isLoading={isLoading} />
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-center gap-3 border-t border-border px-5 py-4">
        <button
          onClick={handleMic}
          disabled={isLoading}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200",
            isListening
              ? "animate-pulse bg-destructive text-destructive-foreground shadow-lg"
              : "bg-primary text-primary-foreground hover:scale-105 hover:shadow-lg",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          aria-label={isListening ? "Detener grabación" : "Iniciar grabación"}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {response && (
          <button
            onClick={toggleTTS}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:bg-accent"
            aria-label={isSpeaking ? "Detener audio" : "Reproducir audio"}
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
