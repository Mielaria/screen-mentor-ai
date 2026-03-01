import { useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export function FeedbackSection({ userName }: { userName: string }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      toast({ title: "Selecciona una calificación", description: "Debes elegir al menos una estrella.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-feedback", {
        body: {
          userName: userName || "Usuario",
          userEmail: user.email,
          rating,
          comment: comment.trim(),
        },
      });

      if (error) throw error;

      toast({ title: "¡Gracias por tu opinión!", description: "Tu comentario nos ayuda a mejorar." });
      setRating(0);
      setComment("");
    } catch (e) {
      console.error(e);
      toast({ title: "Error al enviar", description: "Inténtalo de nuevo más tarde.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="border-t border-border bg-card/30 px-4 py-16">
      <div className="mx-auto max-w-lg text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          ¿Cómo fue tu experiencia con ScreenMentor?
        </h2>

        {/* Stars */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform duration-150 hover:scale-125 focus:outline-none"
              aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
            >
              <Star
                className={`h-9 w-9 transition-colors duration-150 ${
                  star <= (hover || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/40"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe aquí tu sugerencia o comentario…"
          maxLength={1000}
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
        >
          {sending ? "Enviando…" : "Enviar opinión"}
        </button>
      </div>
    </section>
  );
}
