import { useEffect, useRef, type PointerEvent } from 'react';
import { Link } from 'react-router';
import { club, tickerPartidos } from '../data/consultas';
import { LIGA } from '../data/liga';
import type { Partido } from '../data/tipos';
import { diaCorto, hora } from '../lib/formato';
import { useConVivo } from '../lib/contextoVivo';
import { Escudo } from './Escudo';

// Franja fija de resultados (idea del TopScoreboard de la RFL): avanza sola, se arrastra con el dedo
// sin frenarse, respeta el movimiento reducido. La lista va dos veces y vuelve al inicio sin salto.
const SEGUNDOS_VUELTA = 55;

function Ficha({ p, oculta }: { p: Partido; oculta: boolean }) {
  const q = useConVivo(p);
  const vivo = q.estado === 'en-vivo';
  return (
    <Link
      to={`/partido/${q.id}`}
      className={`ficha-marcador${vivo ? ' en-vivo' : ''}`}
      aria-hidden={oculta || undefined}
      tabIndex={oculta ? -1 : undefined}
      draggable={false}
    >
      <span className="ficha-estado">
        {vivo ? (
          <span className="punto-vivo">{q.minuto}′</span>
        ) : q.estado === 'jugado' ? (
          'Final'
        ) : (
          `${diaCorto(q.dia)} · ${hora(q.dia)}`
        )}
      </span>
      {[q.local, q.visitante].map((id, i) => (
        <span className="ficha-equipo" key={id}>
          <Escudo id={id} tam={18} />
          <span className="ficha-sigla">{club(LIGA, id).sigla}</span>
          <span className="num ficha-gol">{q.goles ? (i === 0 ? q.goles.local : q.goles.visitante) : ''}</span>
        </span>
      ))}
    </Link>
  );
}

export function Marcador() {
  const partidos = tickerPartidos(LIGA);
  const pista = useRef<HTMLDivElement | null>(null);
  const pos = useRef(0);
  const arrastre = useRef<{ x: number; pos: number; movio: boolean } | null>(null);

  useEffect(() => {
    const el = pista.current;
    if (!el) return undefined;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cuadro = 0;
    let antes = performance.now();
    const paso = (ahora: number) => {
      const dt = Math.min(ahora - antes, 100) / 1000;
      antes = ahora;
      const mitad = el.scrollWidth / 2;
      if (mitad > 0) {
        if (!arrastre.current && !reducido) pos.current += (mitad / SEGUNDOS_VUELTA) * dt;
        pos.current = ((pos.current % mitad) + mitad) % mitad;
        el.style.transform = `translate3d(${-pos.current}px,0,0)`;
      }
      cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, []);

  const bajar = (ev: PointerEvent<HTMLDivElement>) => {
    arrastre.current = { x: ev.clientX, pos: pos.current, movio: false };
  };
  const mover = (ev: PointerEvent<HTMLDivElement>) => {
    const a = arrastre.current;
    if (!a) return;
    const dx = ev.clientX - a.x;
    if (Math.abs(dx) > 4 && !a.movio) {
      a.movio = true;
      ev.currentTarget.setPointerCapture?.(ev.pointerId);
    }
    if (a.movio) pos.current = a.pos - dx;
  };
  const soltar = () => {
    // Si hubo arrastre, se bloquea el clic que sigue para no abrir el partido por error.
    const a = arrastre.current;
    arrastre.current = null;
    if (!a?.movio) return;
    const bloquear = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('click', bloquear, { capture: true, once: true });
    window.setTimeout(() => window.removeEventListener('click', bloquear, { capture: true }), 0);
  };

  return (
    <div className="marcador" role="region" aria-label="Marcador de resultados y próximos partidos">
      <div className="marcador-etiqueta" aria-hidden="true">
        <span>Clausura</span>
        <b className="num">F{LIGA.ahora.fecha}</b>
      </div>
      <div
        className="marcador-ventana"
        onPointerDown={bajar}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onDragStart={e => e.preventDefault()}
      >
        <div ref={pista} className="marcador-pista">
          {[...partidos, ...partidos].map((p, i) => (
            <Ficha key={`${i < partidos.length ? 'a' : 'b'}-${p.id}`} p={p} oculta={i >= partidos.length} />
          ))}
        </div>
      </div>
    </div>
  );
}
