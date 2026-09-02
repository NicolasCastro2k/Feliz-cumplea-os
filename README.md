# Un Regalo Especial Para Ti 💜

Una experiencia interactiva y romántica llena de animaciones, música, velas,
medusas bioluminiscentes, flores, atardecer y estrellas para esa persona
especial. Hecha con React, TypeScript, Vite y Tailwind CSS.

## Requisitos

- Node.js 18 o superior

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000 en el navegador.

## Personalizar

Todos los textos, preguntas y mensajes están definidos directamente en
`src/defaultConfig.ts` — edítalos ahí antes de desplegar (nombre, preguntas
de las velas, mensajes de cada escena, carta final, etc.).

Dentro de la app, el único panel de personalización disponible es el botón
🎵 "Agregar Canciones", pensado para que ella pueda añadir o cambiar música
mientras avanza por las escenas el día de su cumpleaños. Para añadir MP3
propios, colócalos en la carpeta `public/` y referencia la ruta (ej.
`/mi-cancion.mp3`) o pega un enlace de YouTube. Ver
`public/INSTRUCCIONES_CANCIONES.txt` para más detalle.

## Build de producción

```bash
npm run build
```

Genera una carpeta `dist/` con archivos estáticos listos para desplegar en
cualquier hosting estático (Vercel, Netlify, Cloudflare Pages, GitHub Pages,
etc.). No requiere servidor backend ni variables de entorno.
