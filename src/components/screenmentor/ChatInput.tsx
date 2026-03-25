import { useState, useRef, useEffect } from "react";
import { Send, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendText: (text: string) => void;
  onMicClick: () => void;
  isListening: boolean;
  isLoading: boolean;
}

export function ChatInput({ onSendText, onMicClick, isListening, isLoading }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSendText(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 100) + "px";
    }
  }, [text]);

  return (
    <div className="flex items-end gap-1.5 rounded-xl border border-border bg-accent/30 p-1.5">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu consulta…"
        rows={1}
        disabled={isLoading}
        className="flex-1 resize-none bg-transparent px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 max-h-[100px] scrollbar-thin"
      />
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
            text.trim() && !isLoading
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "text-muted-foreground opacity-40 cursor-not-allowed"
          )}
          title="Enviar"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onMicClick}
          disabled={isLoading}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
            isListening
              ? "animate-pulse bg-destructive text-destructive-foreground"
              : "bg-primary/20 text-primary hover:bg-primary/30",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          title="Micrófono"
        >
          <Mic className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
