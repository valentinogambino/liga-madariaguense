import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router';
import { club } from '../data/consultas';
import { textoGol } from '../lib/texto';
import { LIGA } from '../data/liga';
import type { Evento, Partido } from '../data/tipos';
import { useEnVivo } from '../lib/contextoVivo';
import { Escudo } from './Escudo';
import { Gol } from './Partidos';

const esGol = (e: Evento) => e.tipo === 'gol' || e.tipo === 'penal' || e.tipo === 'en-contra';

// Líneas del campo de juego, de fondo, en trazo finito.
export function Cancha() {
  return (
    <svg className="cancha-fondo" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="10" y="10" width="380" height="200" />
        <line x1="200" y1="10" x2="200" y2="210" />
        <circle cx="200" cy="110" r="34" />
        <rect x="10" y="60" width="52" height="100" />
        <rect x="338" y="60" width="52" height="100" />
        <rect x="10" y="88" width="18" height="44" />
        <rect x="372" y="88" width="18" height="44" />
      </g>
    </svg>
  );
}

export function TarjetaEnVivo({ partido }: { partido?: Partido }) {
  const { partido: vivo, ultimoGol } = useEnVivo();
  const p = partido ?? vivo;
  if (!p || !p.goles) return null;
  const L = club(LIGA, p.local);
  const V = club(LIGA, p.visitante);
  const goles = p.eventos.filter(esGol);
  const terminado = p.estado === 'jugado';
  const progreso = Math.min(100, ((p.minuto ?? 90) / 90) * 100);
  return (
    <Link
      to={`/partido/${p.id}`}
      className="en-vivo-tarjeta"
      style={{ ['--c-local' as string]: L.colores.primario, ['--c-visita' as string]: V.colores.primario }}
    >
      <Cancha />
      <span className="ev-tinte local" aria-hidden="true" />
      <span className="ev-tinte visita" aria-hidden="true" />
      <div className="ev-meta">
        {terminado ? <span className="etiqueta">Final</span> : <span className="punto-vivo">En vivo · {p.minuto}′</span>}
        <span className="etiqueta">
          Clausura · Fecha {p.fecha}
        </span>
      </div>
      <div className="ev-duelo">
        <div className="ev-equipo">
          <Escudo id={L.id} tam={64} />
          <b>{L.nombre}</b>
        </div>
        <div className="ev-resultado num" aria-live="polite">
          <Gol valor={p.goles.local} />
          <i>:</i>
          <Gol valor={p.goles.visitante} />
        </div>
        <div className="ev-equipo">
          <Escudo id={V.id} tam={64} />
          <b>{V.nombre}</b>
        </div>
      </div>
      <div className="ev-goles">
        <ul>
          {goles.filter(e => e.club === L.id).map((e, i) => (
            <li key={i}>
              {textoGol(e)} <span className="num">{e.minuto}′</span>
            </li>
          ))}
        </ul>
        <span className="ev-pelota" aria-hidden="true">⚽</span>
        <ul>
          {goles.filter(e => e.club === V.id).map((e, i) => (
            <li key={i}>
              {textoGol(e)} <span className="num">{e.minuto}′</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="ev-reloj" aria-hidden="true">
        <span style={{ width: `${progreso}%` }} />
      </div>
      <AnimatePresence>
        {ultimoGol && !partido && (
          <motion.div
            key={`${ultimoGol.minuto}-${ultimoGol.jugador}`}
            className="ev-aviso-gol"
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -6], scale: [0.9, 1.04, 1, 1] }}
            transition={{ duration: 4, times: [0, 0.12, 0.8, 1] }}
          >
            ¡Gol de {club(LIGA, ultimoGol.club).corto}! {textoGol(ultimoGol)} {ultimoGol.minuto}′
          </motion.div>
        )}
      </AnimatePresence>
    </Link>
  );
}
