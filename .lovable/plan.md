

# Usar exclusivamente OpenAI con gpt-4o-mini-search-preview

## Cambio

**Archivo:** `supabase/functions/screen-mentor/index.ts`

### 1. Eliminar lógica del gateway (líneas 55-58)

Reemplazar con:
```typescript
const apiKey = Deno.env.get("OPENAI_API_KEY");
```

### 2. Llamada a la API (líneas 146-160)

Usar directamente la API de OpenAI con el modelo exacto:
```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-4o-mini-search-preview-2025-03-11",
    messages,
    max_tokens: 1024,
  }),
});
```

### 3. Log de error (línea 164)

Simplificar a `"OpenAI API error:"`.

## Nota

`OPENAI_API_KEY` ya está configurada en los secretos. El modelo `gpt-4o-mini-search-preview-2025-03-11` soporta imágenes (base64 via `image_url`), texto y system prompts. Todo el sistema de prompts, niveles y lógica de captura se mantiene intacto.

