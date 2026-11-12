import { motion, useReducedMotion } from 'motion/react';
import { Link, useParams } from 'react-router';
import { Escudo } from '../componentes/Escudo';
import { capitan, club, dorsalEn, formacionActual } from '../data/consultas';
import { LIGA } from '../data/liga';
import type { ClubId, Jugador, Posicion } from '../data/tipos';
import { NoEncontrada } from './NoEncontrada';

const LINEAS: Posicion[] = ['DEL', 'MED', 'DEF', 'ARQ'];

const luminosa = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150;
};

function Cancha() {
  return (
    <svg className="formacion-lineas" viewBox="0 0 68 90" preserveAspectRatio="none" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x="0" y={i * 15} width="68" height="7.5" fill="rgb(255 255 255 / .03)" />
      ))}
      <g fill="none" stroke="rgb(255 255 255 / .3)" strokeWidth="0.35">
        <rect x="3" y="3" width="62" height="84" />
        <line x1="3" y1="45" x2="65" y2="45" />
        <circle cx="34" cy="45" r="8" />
        <rect x="14" y="3" width="40" height="14" />
        <rect x="24" y="3" width="20" height="5" />
        <rect x="14" y="73" width="40" height="14" />
        <rect x="24" y="82" width="20" height="5" />
      </g>
    </svg>
  );
}

function Camiseta({ j, clubId, esCapitan }: { j: Jugador; clubId: ClubId; esCapitan: boolean }) {
  const c = club(LIGA, clubId);
  const d = dorsalEn(LIGA, j.id, c.id, LIGA.ahora.temporada) ?? j.dorsal;
  const { primario, secundario } = c.colores;
  return (
    <>
      <span
        className="camiseta"
        style={{ background: primario, borderColor: secundario, color: luminosa(primario) ? '#111' : '#fff' }}
      >
        {d}
        {esCapitan && (
          <i className="brazalete" title="Capitán">
            C
          </i>
        )}
      </span>
      <span className="camiseta-nombre">{j.apellido}</span>
    </>
  );
}

export function Formacion() {
  const { id = '' } = useParams();
  const reducido = useReducedMotion();
  const c = LIGA.clubes.find(x => x.id === id);
  if (!c) return <NoEncontrada />;
  const f = formacionActual(LIGA, c.id);
  const cap = capitan(LIGA, c.id);
  const estilo = { ['--club' as string]: c.colores.primario, ['--club-2' as string]: c.colores.secundario };
  if (!f)
    return (
      <div className="pila" style={estilo}>
        <p className="texto-2">Todavía no hay una formación para {c.nombre}.</p>
        <Link to={`/clubes/${c.id}`} className="boton">
          Volver a la ficha
        </Link>
      </div>
    );

  const p = f.partido;
  const rival = club(LIGA, p.local === c.id ? p.visitante : p.local);
  const lineas = LINEAS.map(pos => ({
    pos,
    js: f.titulares.filter(j => j.posicion === pos).sort((a, b) => a.dorsal - b.dorsal)
  })).filter(l => l.js.length);
  const esquema = lineas
    .filter(l => l.pos !== 'ARQ')
    .map(l => l.js.length)
    .reverse()
    .join('-');
  const yDe = (i: number) => (lineas.length === 1 ? 50 : 11 + (i * 78) / (lineas.length - 1));
  let orden = 0;

  return (
    <div className="pila formacion-pagina" style={estilo}>
      <header className="formacion-cab">
        <Escudo id={c.id} tam={40} />
        <div className="pila" style={{ gap: 2, minWidth: 0 }}>
          <h1>{c.nombre}</h1>
          <p className="texto-2">
            Última formación ·{' '}
            <Link to={`/partido/${p.id}`} className="enlace-arena">
              vs {rival.corto} · fecha {p.fecha}
            </Link>
          </p>
        </div>
        <span className="formacion-esquema num" aria-label={`Esquema ${esquema}`}>
          {esquema}
        </span>
      </header>

      <div className="formacion-cuerpo">
        <div className="formacion-cancha">
          <Cancha />
          {lineas.map((l, i) =>
            l.js.map((j, k) => (
              <div key={j.id} className="formacion-jugador" style={{ left: `${((k + 1) / (l.js.length + 1)) * 100}%`, top: `${yDe(i)}%` }}>
                <motion.div
                  initial={reducido ? false : { opacity: 0, y: 14, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, delay: 0.04 * orden++, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link to={`/jugadores/${j.id}`} className="formacion-link">
                    <Camiseta j={j} clubId={c.id} esCapitan={cap?.id === j.id} />
                  </Link>
                </motion.div>
              </div>
            ))
          )}
        </div>

        <aside className="formacion-suplentes">
          <h2 className="etiqueta">Suplentes</h2>
          <ul>
            {f.suplentes.map(j => (
              <li key={j.id}>
                <Link to={`/jugadores/${j.id}`} className="formacion-link suplente">
                  <Camiseta j={j} clubId={c.id} esCapitan={false} />
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <nav className="acciones" aria-label="Volver">
        <Link to={`/clubes/${c.id}`} className="chip">
          Ficha del club
        </Link>
        <Link to="/posiciones" className="chip">
          Tabla de posiciones
        </Link>
      </nav>
    </div>
  );
}
