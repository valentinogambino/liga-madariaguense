import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router';
import { club, type FilaTabla } from '../data/consultas';
import { LIGA } from '../data/liga';
import type { Partido } from '../data/tipos';
import { useConVivo } from '../lib/contextoVivo';
import { diaCorto, hora } from '../lib/formato';
import { Escudo } from './Escudo';

// Número que cambia con un pequeño salto cuando entra un gol.
export function Gol({ valor, className }: { valor: number; className?: string }) {
  return (
    <span className={`gol-caja ${className ?? ''}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={valor}
          initial={{ y: '-60%', opacity: 0, scale: 1.4 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: '60%', opacity: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 260 }}
        >
          {valor}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function FilaPartido({ partido, mostrarDia = false }: { partido: Partido; mostrarDia?: boolean }) {
  const p = useConVivo(partido);
  const L = club(LIGA, p.local);
  const V = club(LIGA, p.visitante);
  const vivo = p.estado === 'en-vivo';
  const g = p.goles;
  const gano = (lado: 'local' | 'visitante') =>
    g && p.estado === 'jugado' && (lado === 'local' ? g.local > g.visitante : g.visitante > g.local);
  return (
    <Link to={`/partido/${p.id}`} className={`fila-partido${vivo ? ' en-vivo' : ''}`}>
      <span className={`fp-equipo local${gano('local') ? ' gano' : ''}`}>
        <span className="fp-nombre">{L.corto}</span>
        <Escudo id={p.local} tam={26} />
      </span>
      <span className="fp-centro">
        {g ? (
          <span className="fp-resultado num">
            <Gol valor={g.local} />
            <i>–</i>
            <Gol valor={g.visitante} />
          </span>
        ) : (
          <span className="fp-hora num">{hora(p.dia)}</span>
        )}
        <span className="fp-meta">
          {vivo ? <span className="punto-vivo">{p.minuto}′</span> : g ? (mostrarDia ? diaCorto(p.dia) : 'Final') : diaCorto(p.dia)}
        </span>
      </span>
      <span className={`fp-equipo visita${gano('visitante') ? ' gano' : ''}`}>
        <Escudo id={p.visitante} tam={26} />
        <span className="fp-nombre">{V.corto}</span>
      </span>
    </Link>
  );
}

export function Forma({ ultimos, mini = false }: { ultimos: FilaTabla['ultimos']; mini?: boolean }) {
  const texto = { G: 'Ganó', E: 'Empató', P: 'Perdió' } as const;
  return (
    <span className={`forma${mini ? ' mini' : ''}`} aria-label={`Últimos: ${ultimos.map(r => texto[r]).join(', ')}`}>
      {ultimos.map((r, i) => (
        <i key={i} className={r} aria-hidden="true">
          {r}
        </i>
      ))}
    </span>
  );
}

export function TablaPosiciones({ filas, resumida = false, resaltar }: { filas: FilaTabla[]; resumida?: boolean; resaltar?: string[] }) {
  return (
    <div className="tabla-envoltorio">
      <table className={`tabla${resumida ? ' resumida' : ''}`}>
        <thead>
          <tr>
            <th scope="col" className="t-pos">#</th>
            <th scope="col" className="t-club">Club</th>
            <th scope="col">PJ</th>
            {!resumida && (
              <>
                <th scope="col">G</th>
                <th scope="col">E</th>
                <th scope="col">P</th>
                <th scope="col" className="t-ancha">GF</th>
                <th scope="col" className="t-ancha">GC</th>
              </>
            )}
            <th scope="col">DG</th>
            <th scope="col" className={resumida ? 't-forma' : 't-forma t-ancha-m'}>Últimos</th>
            <th scope="col" className="t-pts">Pts</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => {
            const c = club(LIGA, f.club);
            return (
              <tr key={f.club} className={resaltar?.includes(f.club) ? 'resaltada' : undefined} style={{ ['--club' as string]: c.colores.primario }}>
                <td className="t-pos num">{i + 1}</td>
                <td className="t-club">
                  <Link to={`/clubes/${c.id}`}>
                    <Escudo id={c.id} tam={22} />
                    <span>{c.corto}</span>
                  </Link>
                </td>
                <td>{f.pj}</td>
                {!resumida && (
                  <>
                    <td>{f.pg}</td>
                    <td>{f.pe}</td>
                    <td>{f.pp}</td>
                    <td className="t-ancha">{f.gf}</td>
                    <td className="t-ancha">{f.gc}</td>
                  </>
                )}
                <td>{f.dg > 0 ? `+${f.dg}` : f.dg}</td>
                <td className={resumida ? 't-forma' : 't-forma t-ancha-m'}>
                  <Forma ultimos={f.ultimos} mini />
                </td>
                <td className="t-pts num">{f.pts}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function SelectorTemporada({ valor, onCambio, temporadas }: { valor: number; onCambio: (t: number) => void; temporadas: number[] }) {
  return (
    <label className="selector-temporada">
      <span className="etiqueta">Temporada</span>
      <select value={valor} onChange={e => onCambio(Number(e.target.value))}>
        {temporadas.map(t => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SeccionCab({ titulo, enlace, texto }: { titulo: string; enlace?: string; texto?: string }) {
  return (
    <div className="seccion-cab">
      <h2>{titulo}</h2>
      {enlace ? <Link to={enlace}>{texto ?? 'Ver todo'} →</Link> : texto ? <span>{texto}</span> : null}
    </div>
  );
}
