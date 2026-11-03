# Demo del sitio — qué tiene que tener

Definido con el usuario el 2026-11-02, después de la charla con Maximiliano Agüero
([notas](notas-charla-maximiliano.md)). Es un prototipo visual para mostrarle a la liga cómo se vería el sitio;
la versión real (base de datos, panel de carga, importador de Excel) viene después.

## Reglas de la demo

- Se dice siempre **fútbol**, a secas.
- **Solo Primera.** Inferiores, femenino y veteranos quedan fuera.
- **Clubes reales, datos inventados:** los 13 clubes con su nombre, localidad y escudo reales; jugadores, resultados,
  estadísticas, palmarés e historia son inventados. Un cartel discreto «Datos de demostración» en el pie de página.
- **Sin datos privados en pantalla:** el DNI no se muestra (en la versión real va solo al panel).
- **Todo en local**, sin deploy.

## Stack

- Vite + React + TypeScript; Motion y GSAP para las animaciones; las librerías que hagan falta, con versión fija.
- Sitio instalable en el celular (PWA): manifest, ícono y service worker básico.
- Pensado primero para el celular (ancho de referencia 402 px, sin scroll horizontal, áreas seguras del iPhone).
- Skills de diseño: `impeccable`, `frontend-design` y `animate`. Antes de codear, 2 o 3 direcciones visuales para
  que el usuario elija.

## Identidad visual (dirección elegida)

- Base oscura «noche de partido»: casi negro con un verde césped muy apagado.
- Un acento arena (guiño a la costa: Madariaga, Pinamar, Gesell).
- El color de cada club tiñe su ficha (rojo y verde Cosme, celeste Racing, azulgrana San Lorenzo, etc.).
- Tipografía condensada y fuerte para números (resultados, dorsales) y una sans limpia para texto.
- Referencia: el Instagram de la liga, https://www.instagram.com/ligamadariaguensedefutbol/ (revisarlo con Chrome:
  pide sesión).

## Imágenes

- Escudos: recortados de `diseño/escudos-original.png`. Para producción, pedir los originales a la liga o a cada club.
- Jugadores: siluetas con la camiseta del club y el dorsal.
- Ambientación: 6 a 8 fotos generadas o de stock (cancha de pasto, atardecer en la costa, tribuna de club de pueblo)
  para el inicio y las fichas destacadas.

## Pantallas

1. **Inicio:** resultados de la última fecha, próximos partidos, tabla resumida (top 5), goleadores, partido en vivo.
2. **Fixture y resultados** por fecha; detalle de partido con goles y minuto, tarjetas y formaciones (titulares y
   suplentes).
3. **Tabla de posiciones** completa, con los últimos 5 resultados de cada equipo.
4. **Clubes:** grilla de los 13 escudos.
5. **Ficha de club:** fundación, estadio con foto, palmarés, historia, plantel actual y estadísticas de la temporada.
6. **Ficha de jugador:** foto, dorsal, edad, nacionalidad, historial de clubes, goles, amarillas, rojas, titular o
   suplente, títulos.
7. **Comparación entre clubes:** historial de enfrentamientos, últimos partidos y estadísticas lado a lado.
8. **La liga:** historia, campeones por año, clubes con más títulos.

Agregados para que se vea profesional:

9. **Suspendidos y sanciones:** quién no puede jugar la próxima fecha (acumulación de amarillas, fechas por roja).
10. **Estadísticas:** goleadores, asistencias, tarjetas, valla menos vencida, fair play por club, más minutos.
11. **Partido en vivo simulado:** minuto corriendo y goles que entran con animación.
12. **Buscador global** de jugadores, clubes y partidos.
13. **Tarjetas para compartir:** imagen de un resultado o de una ficha de jugador lista para Instagram o WhatsApp.
14. **Mapa de canchas** con «cómo llegar».
15. **PWA** instalable (ver Stack).

**Marcador arriba de todo**, como el `TopScoreboard` de la RFL (`coding/rfl/client/components/site/header/ticker.tsx`):
franja fija con resultados recientes y próximos partidos, avanza sola, se arrastra con el dedo, respeta el
movimiento reducido; el partido en vivo va primero.

Las más pulidas: Inicio y Ficha de jugador. Si hay que recortar, cae primero «La liga».

Fuera de la demo: cuota societaria y publicidad, noticias.

## Datos inventados

- Generador con semilla fija: los mismos datos en cada corrida.
- Temporada 2026: **Apertura y Clausura**, todos contra todos a una rueda (13 fechas, un equipo libre por fecha), y
  **final** entre los dos ganadores (campeón directo si es el mismo).
- La demo queda «congelada» en el **Clausura, fecha 9**: Apertura terminado con campeón, última fecha jugada,
  próxima programada y un partido en vivo.
- Detalle partido a partido de **2024, 2025 y 2026**; solo el campeón de cada año **desde 1990**.
- Unos 22 jugadores por club, nombres inventados verosímiles, algunos pases entre clubes y algún veterano de un
  solo club.
