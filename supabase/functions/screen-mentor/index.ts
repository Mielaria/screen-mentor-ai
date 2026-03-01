import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LEVEL_PROMPTS: Record<string, string> = {
  basico: `Eres un mentor extremadamente detallado para principiantes. 
- Indica la ubicación exacta de cada botón o herramienta (ej: "En la barra superior", "En el panel derecho", "En la esquina inferior izquierda").
- No asumas conocimiento previo del usuario.
- Evita atajos de teclado a menos que los expliques paso a paso.
- Usa lenguaje simple y claro.
- Cada paso debe ser muy descriptivo.`,

  intermedio: `Eres un mentor directo para usuarios con experiencia intermedia.
- Sé más conciso, omite explicaciones obvias.
- Usa terminología estándar del software.
- Mantén pasos claros pero sin extenderte innecesariamente.
- Puedes mencionar atajos de teclado comunes.`,

  avanzado: `Eres un mentor técnico para usuarios avanzados.
- Prioriza atajos de teclado y comandos rápidos.
- Usa terminología técnica sin explicarla.
- Evita explicaciones básicas.
- Solo describe rutas de menú si es estrictamente necesario.
- Sé lo más breve y directo posible.`,
};

const SOFTWARE_SCOPES: Record<string, string> = {
  photoshop: `Funciones soportadas en esta demo de Photoshop:
- Eliminar fondo
- Recortar imagen
- Agregar texto
- Cambiar tamaño
- Exportar imagen`,

  canva: `Funciones soportadas en esta demo de Canva:
- Cambiar color de fondo
- Añadir texto
- Añadir elementos u objetos
- Modificar tamaño o tipografía
- Exportar diseño`,

  shapr3d: `Funciones soportadas en esta demo de Shapr3D:
- Crear boceto básico
- Modificar medidas (ancho, alto, largo)
- Realizar extrusión
- Alinear objetos`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_base64, texto_transcrito, nivel_usuario, software_seleccionado } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const nivel = nivel_usuario?.toLowerCase() || "basico";
    const software = software_seleccionado?.toLowerCase() || "photoshop";

    const levelPrompt = LEVEL_PROMPTS[nivel] || LEVEL_PROMPTS.basico;
    const scopeInfo = SOFTWARE_SCOPES[software] || "";

    const outOfScope = `Si la solicitud del usuario está fuera de las funciones soportadas o no corresponde al software seleccionado, responde EXACTAMENTE: "Esta demo está optimizada para funciones específicas de Photoshop, Canva y Shapr3D."`;

    const systemPrompt = `Eres un mentor practico y adaptable que guia paso a paso dentro del software que el usuario este utilizando.

Software soportado en esta demo: Canva, Photoshop, Shapr3D.

${levelPrompt}

Software seleccionado: ${software_seleccionado}
${scopeInfo}

Idioma: Responde en el mismo idioma que detectes en la interfaz de la captura o en el mensaje del usuario.

Formato:
- Presenta las instrucciones en pasos ordenados.
- Se claro y practico.
- Usa terminologia real del software correspondiente.
- Adapta la respuesta al estado actual visible en la captura de pantalla.

Comportamiento:
- Detecta automaticamente que software esta siendo usado segun la imagen o el contexto.
- Si la solicitud no corresponde a Canva, Photoshop o Shapr3D, responde exactamente: "Esta demo esta optimizada para Canva, Photoshop y Shapr3D."

ANALISIS VISUAL OBLIGATORIO:
Si se proporciona una captura de pantalla, analiza antes de responder:
1. Identifica el software visible.
2. Detecta el idioma de la interfaz.
3. Observa que paneles estan abiertos.
4. Determina si hay un documento abierto o pantalla inicial.
5. Ajusta las instrucciones a los elementos visibles.

REGLAS:
- No asumas una version generica.
- No describas botones que no esten visibles en la captura.
- Usa referencias espaciales reales (panel derecho, barra superior, etc.).
- Si el idioma de la interfaz no es espanol, adapta los nombres de botones al idioma visible.
- No inventes elementos que no esten presentes en la imagen.

FORMATO DE RESPUESTA:
- Texto plano sin Markdown (sin asteriscos, guiones, negritas, backticks, almohadillas, emojis).
- Cada paso es una oracion independiente en una linea separada, SIN numeros ni vinetas al inicio.
- No agregues titulos, encabezados, advertencias ni notas adicionales.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Build user message with image if provided
    if (image_base64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${image_base64}`,
              detail: "low",
            },
          },
          {
            type: "text",
            text: texto_transcrito || "¿Qué puedo hacer aquí?",
          },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: texto_transcrito || "¿Qué puedo hacer aquí?",
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", response.status, errText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo en unos segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Error al procesar con IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No se pudo generar una respuesta.";

    return new Response(JSON.stringify({ steps: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("screen-mentor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
