# P2P Chat 1-a-1 (WebRTC DataChannel) — Milestone 1

Este proyecto prepara una app web estática para publicarse en **GitHub Pages**.

## Estado actual

Se implementó únicamente el **Milestone 1**:

- ✅ UI estática
- ✅ Estructura base para offer/answer por copy/paste
- ✅ Placeholders de chat y logs
- ✅ Sin WebRTC real todavía

## Estructura

- `index.html`: layout principal y secciones de la app
- `style.css`: estilos responsivos
- `app.js`: lógica mínima de UI (estado visual, botones placeholder y reinicio de interfaz)

## Qué hace hoy

- Permite seleccionar rol visualmente (A o B).
- Muestra áreas de texto para `offer` y `answer` (sin conexión real).
- Incluye un bloque de chat deshabilitado (placeholder para Milestone 2).
- Incluye un área de logs local de eventos de interfaz.
- Permite limpiar rol y reiniciar la UI.

## Qué **no** hace todavía

- No crea `RTCPeerConnection`.
- No genera ni aplica offer/answer reales.
- No abre `RTCDataChannel`.
- No intercambia mensajes entre dispositivos.

## Cómo ejecutar localmente

Al ser sitio estático, puedes abrir `index.html` directamente en el navegador o usar un servidor estático simple.

Ejemplo con Python:

```bash
python3 -m http.server 8080
```

Luego abre:

```text
http://localhost:8080
```

## Publicar en GitHub Pages (preview estático)

1. Sube este repositorio a GitHub.
2. Ve a **Settings → Pages**.
3. En **Build and deployment** selecciona:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` (o la rama por defecto) y carpeta `/ (root)`
4. Guarda y espera la URL pública.

> Nota: En milestones siguientes se añadirá la conexión WebRTC manual completa para cumplir el MVP.
