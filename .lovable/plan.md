

# Cambiar modelo a gpt-4o-mini-search-preview-2025-03-11

## Contexto

La función `screen-mentor` actualmente usa el modelo `gpt-4o` de OpenAI. El usuario quiere cambiarlo a `gpt-4o-mini-search-preview-2025-03-11`.

**Nota importante:** El modelo anterior `gpt-4o-search-preview` falló porque el proyecto de OpenAI no tenía acceso. Este nuevo modelo podría tener la misma restricción. Si falla, habrá que revertir a `gpt-4o`.

## Cambio

**Archivo:** `supabase/functions/screen-mentor/index.ts` (línea 137)

Cambiar:
```
model: "gpt-4o"
```
Por:
```
model: "gpt-4o-mini-search-preview-2025-03-11"
```

Un solo cambio de una línea. No se modifica nada más.

