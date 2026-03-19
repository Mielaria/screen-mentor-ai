

# Actualizar el prompt del sistema en `screen-mentor`

## Resumen

Modificar el `systemPrompt` y los `LEVEL_PROMPTS` en `supabase/functions/screen-mentor/index.ts` para incorporar tres comportamientos nuevos:

1. **Buscar documentación en Internet**: Siempre indicar la versión del software que el usuario está usando y basar las instrucciones en la documentación oficial de esa versión.
2. **Herramientas no visibles en la captura**: Si una herramienta necesaria no aparece visible en la imagen, explicar cómo activarla/mostrarla antes de dar la instrucción.
3. **Herramientas visibles**: Si la herramienta ya está visible, ir directo a la instrucción sin explicaciones innecesarias de cómo encontrarla.

## Cambios

**Archivo:** `supabase/functions/screen-mentor/index.ts`

### 1. Agregar reglas al `systemPrompt` (después de "ANALISIS VISUAL OBLIGATORIO")

Añadir una nueva sección:

```
VERSION Y DOCUMENTACION:
- Identifica la version del software visible en la captura (por menus, pantalla de inicio o elementos de interfaz).
- Basa tus instrucciones en la documentacion oficial de esa version especifica.
- Si no puedes determinar la version, pregunta al usuario cual version esta usando.
- Menciona siempre a que version corresponden tus instrucciones.

HERRAMIENTAS NO VISIBLES:
- Si una herramienta o panel necesario para la tarea NO esta visible en la captura, explica primero como activarlo o mostrarlo (por ejemplo, desde que menu abrirlo).
- Si la herramienta SI esta visible en la captura, ve directo a la instruccion sin explicar como encontrarla.
```

### 2. Reforzar los `LEVEL_PROMPTS`

- **Básico**: Mantener el nivel de detalle extremo actual. Agregar que si una herramienta no está visible, debe explicar paso a paso cómo mostrarla con descripciones visuales completas.
- **Intermedio**: Agregar que si una herramienta no está visible, indique brevemente cómo abrirla. Si está visible, ir directo al grano.
- **Avanzado**: Agregar que priorice atajos de teclado para todo (incluyendo abrir paneles ocultos). Solo describir rutas de menú como alternativa.

### Archivos modificados
- `supabase/functions/screen-mentor/index.ts` — actualización del prompt del sistema y los prompts por nivel.

