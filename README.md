# P2P Chat 1-a-1 (WebRTC DataChannel) — Milestone 2

Este proyecto implementa una app web para chat P2P 1-a-1 usando **WebRTC** con señalización manual por copy/paste en JSON.

## Estado actual

Se implementó el **Milestone 2**:

- ✅ `RTCPeerConnection` real
- ✅ `RTCDataChannel` para mensajes de texto
- ✅ Flujo manual completo de offer/answer
- ✅ Exportación e importación de señalización en JSON (textareas)
- ✅ Espera a ICE gathering completo antes de exportar SDP local

## Flujo manual de conexión

1. En navegador A, elige **Soy A** y pulsa **Generar offer**.
2. Copia el JSON de **Offer local generada (A)** y pégalo en **Offer remota pegada (B)** en navegador B.
3. En navegador B, elige **Soy B**, pulsa **Aplicar offer** y luego **Generar answer**.
4. Copia el JSON de **Answer local generada (B)** y pégalo en **Answer remota pegada (A)** en navegador A.
5. En navegador A, pulsa **Aplicar answer**.
6. Cuando el DataChannel quede en estado abierto, ambos lados pueden enviar y recibir mensajes.

## Estructura

- `index.html`: layout principal y secciones de rol, señalización, chat y logs.
- `style.css`: estilos responsivos y componentes visuales.
- `app.js`: lógica WebRTC, DataChannel, señalización manual por JSON, chat y logs.

## Cómo ejecutar localmente

Puedes abrir `index.html` directamente o usar un servidor estático.

Ejemplo con Python:

```bash
python3 -m http.server 8080
```

Luego abre:

```text
http://localhost:8080
```

## Limitaciones actuales

- No hay QR para señalización.
- No hay audio/video.
- No hay soporte multiusuario (solo 1-a-1).
