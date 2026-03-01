import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userName, userEmail, rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: "Se requiere una calificación válida (1-5)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
    const ENVIO_CALIFICACIONES = Deno.env.get("ENVIO_CALIFICACIONES");

    if (!ADMIN_EMAIL || !ENVIO_CALIFICACIONES) {
      throw new Error("Missing required secrets: ADMIN_EMAIL or ENVIO_CALIFICACIONES");
    }

    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const now = new Date().toLocaleString("es-ES", { timeZone: "America/Mexico_City" });

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6d28d9;">Nueva opinión de ScreenMentor</h2>
        <hr style="border: 1px solid #e5e7eb;" />
        <p><strong>Usuario:</strong> ${userName || "No disponible"}</p>
        <p><strong>Correo:</strong> ${userEmail || "No disponible"}</p>
        <p><strong>Calificación:</strong> <span style="color: #f59e0b; font-size: 20px;">${stars}</span> (${rating}/5)</p>
        <p><strong>Comentario:</strong></p>
        <p style="background: #f3f4f6; padding: 12px; border-radius: 8px;">${comment || "Sin comentario"}</p>
        <p style="color: #9ca3af; font-size: 12px;">Enviado el: ${now}</p>
      </div>
    `;

    // Use the ENVIO_CALIFICACIONES secret as the Resend API key
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENVIO_CALIFICACIONES}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ScreenMentor <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `Nueva calificación de ${userName || "Usuario"} — ${rating}/5 ★`,
        html: htmlBody,
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error("Resend error:", emailResponse.status, errText);
      throw new Error("Error al enviar el correo");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-feedback error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
