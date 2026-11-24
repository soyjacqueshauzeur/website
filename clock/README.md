# time — versión web

Página estática con la misma hora y fecha que la app de escritorio. Solo HTML,
CSS y JS: sin build, sin frameworks, sin dependencias.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Página completa (hora + fecha) |
| `style.css` | Tema oscuro y tipografía |
| `clock.js` | Actualiza la hora cada segundo |
| `time.svg` | Icono/favicon |

## Ver en local

```bash
cd ~/opencode/soyjacqueshauzeur
python3 -m http.server 8765
```

Abre `http://127.0.0.1:8765/clock/`.

## Publicar

Está publicada en **https://soyjacqueshauzeur.dev/clock/** (GitHub Pages).
Para llevarla a otro sitio, copia los cuatro archivos a cualquier hosting
estático (Cloudflare Pages, Netlify, un subdirectorio…). No necesita servidor
ni configuración especial.

## Incrustar en una página existente

1. Copia el bloque del `index.html`:

   ```html
   <main class="time-clock" aria-label="Hora y fecha">
     <time id="clock" class="time-clock__time">--:--:--</time>
     <time id="date" class="time-clock__date"></time>
   </main>
   ```

2. Copia en tu CSS las reglas de `.time-clock`, `.time-clock__time` y
   `.time-clock__date` (y el `@media` de móvil).
3. Incluye `clock.js` antes de `</body>`.
4. Dale al contenedor el fondo `#111114` y el alto que quieras. Por ejemplo:

   ```html
   <section style="background:#111114; min-height:100vh; display:grid; place-items:center;">
     <main class="time-clock">…</main>
   </section>
   ```

## Diseño

- Fondo `#111114` (`--ink` de lemonshake).
- Hora `#D4FF3D` (`--lime`), fecha `#F4F4F0` (`--paper`).
- Fuente **Ubuntu** (Google Fonts, con respaldo al sistema).
- La hora ocupa el 88 % del ancho, igual que la app; la fecha va debajo,
  centrada y en blanco.
- Formato 24 h y fecha `Tuesday, 24 November, 2026, week 48` (semana ISO).
- Sin barras ni botones: solo hora y fecha.

## Hora

Usa la hora local del dispositivo. Un navegador **no puede** consultar NTP por
UDP; si el equipo sincroniza su reloj (lo normal), la página también es exacta.
La app de escritorio sí hace NTP.

## Cambiar idioma o formato

- En `clock.js`, edita `WEEKDAYS` y `MONTHS` (por ejemplo, a español).
- Para 12 h, cambia el formateo de la hora a `%I:%M:%S %p` equivalente en JS
  (`getHours() % 12 || 12` y añade AM/PM).
- En `style.css`, cambia `--time-bg`, `--time-lime` y `--time-paper`.

## Accesibilidad

- La hora y la fecha son elementos `<time>` con `datetime` actualizado.
- No hay región `aria-live`: el cambio cada segundo no se anuncia a los
  lectores de pantalla.
