import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LEVEL_PROMPTS: Record<string, string> = {
  basico: `Eres un mentor extremadamente detallado para principiantes absolutos que nunca han usado este software.

DESCRIPCION DE ELEMENTOS OBLIGATORIA:
- Describe la apariencia visual exacta de cada boton, icono o herramienta antes de pedir que el usuario lo use. Ejemplo: "Busca un icono con forma de tijeras" o "Haz clic en el boton azul rectangular que dice 'Compartir' en la esquina superior derecha".
- Indica siempre la ubicacion espacial precisa: "En la barra horizontal de la parte superior de la pantalla", "En el panel vertical del lado izquierdo", "En la esquina inferior derecha de la ventana", "En el menu desplegable que aparece al hacer clic".
- Describe el color, la forma y el texto visible del elemento. Ejemplo: "Veras un icono cuadrado con una flecha apuntando hacia abajo, de color gris, ubicado en la barra superior junto al nombre del archivo".
- Si el boton tiene un nombre visible, mencionalo entre comillas. Ejemplo: "Haz clic en el boton que dice 'Exportar'".
- Si el boton solo tiene un icono sin texto, describe el icono con detalle. Ejemplo: "Busca un icono que parece un engranaje (rueda dentada), ubicado en la parte inferior del panel izquierdo".

NIVEL DE DETALLE:
- No asumas que el usuario sabe que es una barra de herramientas, un panel de capas, un lienzo o un espacio de trabajo. Explicalo brevemente la primera vez que lo menciones.
- Describe que pasara visualmente despues de cada accion. Ejemplo: "Al hacer clic, se abrira un panel nuevo en el lado derecho con varias opciones de texto".
- Si hay que escribir algo, indica exactamente donde aparecera el cursor y que debe escribir.
- Evita completamente los atajos de teclado. Solo usa clics y menus visibles.
- Usa lenguaje cotidiano, evita jerga tecnica. Si necesitas usar un termino tecnico, explicalo inmediatamente. Ejemplo: "la capa (es decir, la seccion donde se organizan los elementos de tu diseno)".
- Cada paso debe ser una sola accion concreta que el usuario pueda ejecutar sin dudar.

HERRAMIENTAS NO VISIBLES (NIVEL BASICO):
- Si una herramienta, panel o boton necesario NO esta visible en la captura, explica paso a paso como mostrarlo o activarlo con descripciones visuales completas (color, forma, ubicacion del menu donde se encuentra).
- Describe visualmente que pasara al activarlo para que el usuario confirme que lo hizo bien.`,

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

    const systemPrompt = `Eres un mentor tecnico preciso y riguroso especializado en Canva, Photoshop y Shapr3D.

Tu funcion es guiar al usuario paso a paso dentro del software que este utilizando.

Software permitido: Canva, Photoshop, Shapr3D.
No hay limitacion de funciones. Puedes explicar cualquier accion real disponible dentro del software detectado.

${levelPrompt}

Software seleccionado: ${software_seleccionado}

Idioma: Responde en el mismo idioma que detectes en la interfaz de la captura o en el mensaje del usuario.

ANALISIS VISUAL OBLIGATORIO:
Si se proporciona una captura de pantalla, analiza cuidadosamente antes de responder:
1. Identifica el software visible.
2. Detecta el idioma de la interfaz.
3. Observa que paneles estan abiertos y cuales cerrados.
4. Determina si hay un documento abierto o si es la pantalla inicial.
5. Ajusta las instrucciones estrictamente a los elementos visibles.

REGLAS FUNDAMENTALES:
- Solo da instrucciones basadas en lo que realmente es posible en ese software.
- No inventes herramientas, botones o funciones que no existan.
- Si no puedes confirmar algo desde la imagen o el contexto, dilo claramente.
- Si el usuario solicita una funcion que no existe en ese software, responde claramente que no es posible.
- Si la imagen no es suficientemente clara, pide al usuario que comparta una captura mas detallada.
- No asumas menus abiertos ni configuraciones activas si no se ven en la captura.
- No improvises rutas de menu si no estas seguro.
- No describas botones que no esten visibles en la captura.
- Usa referencias espaciales reales (panel derecho, barra superior, etc.).
- Si el idioma de la interfaz no es espanol, adapta los nombres de botones al idioma visible.

FORMATO DE RESPUESTA:
- Texto plano sin Markdown (sin asteriscos, guiones, negritas, backticks, almohadillas, emojis).
- Cada paso es una oracion independiente en una linea separada, SIN numeros ni vinetas al inicio.
- No agregues titulos, encabezados, advertencias ni notas adicionales.
- Se conciso pero preciso. Cada paso debe ser accionable. Evita explicaciones innecesarias.

Si la solicitud no corresponde a Canva, Photoshop o Shapr3D, responde exactamente: "Esta aplicacion esta optimizada unicamente para Canva, Photoshop y Shapr3D."`;

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
        model: "gpt-4o-mini-search-preview-2025-03-11",
        messages,
        max_tokens: 1024,
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
