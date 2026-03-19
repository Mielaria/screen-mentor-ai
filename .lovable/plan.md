

# Eliminar `temperature` del Edge Function screen-mentor

## Cambio

**Archivo:** `supabase/functions/screen-mentor/index.ts`

Eliminar la línea `temperature: 0.3` del body enviado a OpenAI, ya que el modelo `gpt-4o-mini-search-preview-2025-03-11` no soporta este parámetro y causa error 400.

```
// Antes:
model: "gpt-4o-mini-search-preview-2025-03-11",
messages,
max_tokens: 1024,
temperature: 0.3,

// Después:
model: "gpt-4o-mini-search-preview-2025-03-11",
messages,
max_tokens: 1024,
```

Un solo cambio de una línea.

