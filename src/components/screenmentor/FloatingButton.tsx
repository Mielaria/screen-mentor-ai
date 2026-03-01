import { MessageCircle, X } from "lucide-react";

interface FloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function FloatingButton({ isOpen, onClick }: FloatingButtonProps) {
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary/30"
      aria-label="Abrir asistente"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
