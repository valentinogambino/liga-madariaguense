# Liga Madariaguense de Fútbol — demo

Demo visual del sitio de la Liga Madariaguense de Fútbol: los 13 clubes reales con datos inventados, pensada primero
para el celular. Qué tiene que tener: [`docs/DEMO.md`](docs/DEMO.md).

## Cómo correrla

Requiere Node 24.

```sh
npm install
npm run dev        # http://localhost:5180
```

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run typecheck` | Chequeo de tipos |
| `npm run lint` | ESLint |
| `npm test` | Tests del generador de datos (Vitest) |
| `npm run build` | Compila a `dist/` con el service worker de la PWA |
| `npm run build:pages` | Compila a `dist-pages/` y prepara la demo para GitHub Pages |
| `npm run preview` | Sirve lo compilado en http://localhost:5181 (para probar la instalación como app) |

## Publicar en GitHub Pages

Corré `npm run build:pages` y volvé a subir (push) el contenido de `dist-pages/`, incluidos `.nojekyll` y
`404.html`, a la rama `main` del repo público `valentinogambino/liga-madariaguense`, que solo contiene el sitio
compilado. La demo se publica en https://valentinogambino.github.io/liga-madariaguense/.
El código fuente y las notas no se publican.

## Cómo está armada

- `src/data/`: modelo (`tipos.ts`), clubes reales (`clubes.ts`), generador con semilla fija (`generar.ts`) y consultas
  puras (`consultas.ts`). La demo queda congelada en el Clausura 2026, fecha 9, con Cosme–Racing en vivo.
- `src/lib/enVivo.tsx`: simulación del partido en vivo (el reloj avanza un minuto cada 6 segundos y entran los goles
  que faltan).
- `src/componentes/` y `src/paginas/`: interfaz. Estilos en `src/estilos/` con los tokens de la dirección «Noche de
  partido» en `base.css`.
- `public/escudos/`: los 13 escudos recortados de `diseño/escudos-original.png` con
  `python -I scripts/recortar_escudos.py` (Pillow). Para producción hay que pedir los originales.
