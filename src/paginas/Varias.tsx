import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';
import { Escudo } from '../componentes/Escudo';
import { FilaPartido, SeccionCab } from '../componentes/Partidos';
import {
  amonestados, asistidores, buscar, club, fairPlay, goleadores, jugador, masMinutos, nombreJugador, partido,
  titulosPorClub, vallaMenosVencida, type Ranking
} from '../data/consultas';
import { LIGA } from '../data/liga';
import type { TipoTorneo } from '../data/tipos';
import { diaCorto } from '../lib/formato';

// ---------- La liga ----------

export function LaLiga() {
  const titulos = titulosPorClub(LIGA).filter(t => t.anios.length);
  const max = titulos[0]?.anios.length ?? 1;
  const campeones = [...LIGA.campeones].reverse();
  return (
    <div className="pila" style={{ gap: 28 }}>
      <header className="titulo-pagina">
        <span className="etiqueta">Desde 1990</span>
        <h1>La liga</h1>
        <p>
          La Liga Madariaguense de Fútbol organiza el fútbol de General Madariaga, Pinamar, Ostende, Valeria del Mar y
          Villa Gesell. Primera se juega en dos torneos por año, Apertura y Clausura, todos contra todos a una rueda; si
          los ganadores son distintos, una final define al campeón de la temporada.
        </p>
      </header>
      <div className="grilla-2">
        <section className="pila">
          <SeccionCab titulo="Campeones por año" />
          <ol className="lista campeones">
            {campeones.map(c => (
              <li key={c.anio}>
                <span className="num cp-anio">{c.anio}</span>
                <Link to={`/clubes/${c.campeon}`} className="cp-club">
                  <Escudo id={c.campeon} tam={24} />
                  <b>{club(LIGA, c.campeon).nombre}</b>
                </Link>
                <span className="texto-2 cp-sub">Sub: {club(LIGA, c.subcampeon).corto}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="pila">
          <SeccionCab titulo="Más ganadores" />
          <div className="lista ganadores">
            {titulos.map(t => (
              <Link key={t.club} to={`/clubes/${t.club}`} style={{ ['--club' as string]: club(LIGA, t.club).colores.primario }}>
                <Escudo id={t.club} tam={28} />
                <span className="pila" style={{ gap: 4, minWidth: 0 }}>
                  <b>{club(LIGA, t.club).nombre}</b>
                  <span className="barra-titulos">
                    <span style={{ width: `${(t.anios.length / max) * 100}%` }} />
                  </span>
                </span>
                <span className="num gl-valor">{t.anios.length}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------- Sanciones ----------

export function Sanciones() {
  const proxima = LIGA.ahora.fecha + 1;
  return (
    <div className="pila" style={{ gap: 24 }}>
      <header className="titulo-pagina">
        <span className="etiqueta">Clausura {LIGA.ahora.temporada}</span>
        <h1>Suspendidos</h1>
        <p>No pueden jugar la fecha {proxima}. Cinco amarillas en el torneo suman una fecha de suspensión; la roja, entre una y tres según el informe arbitral.</p>
      </header>
      <div className="lista">
        {LIGA.sanciones.map(s => {
          const j = jugador(LIGA, s.jugador)!;
          const p = partido(LIGA, s.desde)!;
          const rival = p.local === s.club ? p.visitante : p.local;
          return (
            <Link key={`${s.jugador}-${s.desde}`} to={`/jugadores/${j.id}`} className="sancion">
              <Escudo id={s.club} tam={30} />
              <span className="pila" style={{ gap: 2, minWidth: 0 }}>
                <b>{nombreJugador(j)}</b>
                <span className="texto-2">
                  {s.motivo === 'roja' ? 'Expulsado' : '5 amarillas'} vs {club(LIGA, rival).corto} · {diaCorto(p.dia)}
                </span>
              </span>
              <span className="sancion-fechas">
                {s.motivo === 'roja' ? <span className="tarjeta-roja" /> : <span className="tarjeta-amarilla" />}
                <b className="num">{s.fechas}</b>
                <span>{s.fechas === 1 ? 'fecha' : 'fechas'}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Estadísticas ----------

function Ranking({ titulo, filas, unidad }: { titulo: string; filas: Ranking[]; unidad?: string }) {
  return (
    <section className="pila">
      <SeccionCab titulo={titulo} />
      <ol className="lista goleadores-lista">
        {filas.map((r, i) => (
          <li key={r.jugador.id}>
            <Link to={`/jugadores/${r.jugador.id}`}>
              <span className="num gl-pos">{i + 1}</span>
              <Escudo id={r.jugador.club} tam={20} />
              <span className="gl-nombre">{nombreJugador(r.jugador)}</span>
              <span className="num gl-valor">
                {r.valor}
                {unidad && <small className="texto-2"> {unidad}</small>}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Estadisticas() {
  const t = LIGA.ahora.temporada;
  const [torneo, setTorneo] = useState<TipoTorneo | 'Temporada'>('Clausura');
  const tr = torneo === 'Temporada' ? undefined : torneo;
  const vallas = vallaMenosVencida(LIGA, t, torneo === 'Apertura' ? 'Apertura' : 'Clausura').slice(0, 5);
  const fp = fairPlay(LIGA, t, tr);
  return (
    <div className="pila" style={{ gap: 24 }}>
      <header className="titulo-pagina">
        <span className="etiqueta">Primera · {t}</span>
        <h1>Estadísticas</h1>
      </header>
      <div className="chips" role="group" aria-label="Torneo">
        {(['Clausura', 'Apertura', 'Temporada'] as const).map(x => (
          <button key={x} type="button" className="chip" aria-pressed={x === torneo} onClick={() => setTorneo(x)}>
            {x}
          </button>
        ))}
      </div>
      <div className="grilla-estad">
        <Ranking titulo="Goleadores" filas={goleadores(LIGA, t, tr, 10)} />
        <Ranking titulo="Asistencias" filas={asistidores(LIGA, t, tr, 10)} />
        <Ranking titulo="Amonestados" filas={amonestados(LIGA, t, tr, 8)} />
        <Ranking titulo="Más minutos" filas={masMinutos(LIGA, t, tr, 8)} unidad="min" />
        <section className="pila">
          <SeccionCab titulo="Valla menos vencida" texto={torneo === 'Temporada' ? 'Clausura' : torneo} />
          <ol className="lista goleadores-lista">
            {vallas.map((v, i) => (
              <li key={v.club}>
                <Link to={`/clubes/${v.club}`}>
                  <span className="num gl-pos">{i + 1}</span>
                  <Escudo id={v.club} tam={20} />
                  <span className="gl-nombre">{club(LIGA, v.club).nombre}</span>
                  <span className="num gl-valor">
                    {v.gc}
                    <small className="texto-2"> en {v.pj}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
        <section className="pila">
          <SeccionCab titulo="Fair play" texto="Amarilla 1 · roja 3" />
          <ol className="lista goleadores-lista">
            {fp.map((f, i) => (
              <li key={f.club}>
                <Link to={`/clubes/${f.club}`}>
                  <span className="num gl-pos">{i + 1}</span>
                  <Escudo id={f.club} tam={20} />
                  <span className="gl-nombre">{club(LIGA, f.club).corto}</span>
                  <span className="fp-tarjetas texto-2">
                    <span className="tarjeta-amarilla" /> {f.amarillas} <span className="tarjeta-roja" /> {f.rojas}
                  </span>
                  <span className="num gl-valor">{f.puntos}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

// ---------- Buscar ----------

export function Buscar() {
  const [texto, setTexto] = useState('');
  const diferido = useDeferredValue(texto);
  const res = buscar(LIGA, diferido);
  return (
    <div className="pila" style={{ gap: 20 }}>
      <header className="titulo-pagina">
        <h1>Buscar</h1>
      </header>
      <label className="buscador">
        <span className="sr">Buscar jugadores, clubes o partidos</span>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4" />
        </svg>
        <input
          id="buscar"
          type="search"
          autoFocus
          autoComplete="off"
          placeholder="Jugador, club o partido (ej.: Cosme Racing)"
          value={texto}
          onChange={e => setTexto(e.target.value)}
        />
      </label>
      {diferido.trim().length >= 2 && !res.length && <p className="texto-2">Sin resultados para «{diferido}».</p>}
      {res.length > 0 && (
        <div className="lista">
          {res.map(r =>
            r.tipo === 'club' ? (
              <Link key={r.club.id} to={`/clubes/${r.club.id}`} className="resultado-busqueda">
                <Escudo id={r.club.id} tam={28} />
                <span className="pila" style={{ gap: 0 }}>
                  <b>{r.club.nombre}</b>
                  <span className="texto-2">Club · {r.club.localidad}</span>
                </span>
              </Link>
            ) : r.tipo === 'jugador' ? (
              <Link key={r.jugador.id} to={`/jugadores/${r.jugador.id}`} className="resultado-busqueda">
                <Escudo id={r.jugador.club} tam={28} />
                <span className="pila" style={{ gap: 0 }}>
                  <b>{nombreJugador(r.jugador)}</b>
                  <span className="texto-2">
                    Jugador · {club(LIGA, r.jugador.club).corto} · {r.jugador.dorsal}
                  </span>
                </span>
              </Link>
            ) : (
              <FilaPartido key={r.partido.id} partido={r.partido} mostrarDia />
            )
          )}
        </div>
      )}
      {diferido.trim().length < 2 && (
        <div className="pila">
          <span className="etiqueta">Sugerencias</span>
          <div className="chips">
            {['Cosme', 'Gesell', 'Pinamar', 'Racing San Lorenzo', 'González'].map(s => (
              <button key={s} type="button" className="chip" onClick={() => setTexto(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Canchas ----------

// Mapa esquemático (no a escala): cada localidad tiene un centro y sus canchas se reparten alrededor.
const PUEBLOS = [
  { nombre: 'General Madariaga', x: 92, y: 118, tx: 92, ty: 186, ancla: 'middle' },
  { nombre: 'Pinamar', x: 300, y: 196, tx: 252, ty: 172, ancla: 'end' },
  { nombre: 'Ostende', x: 292, y: 270, tx: 266, ty: 274, ancla: 'end' },
  { nombre: 'Valeria del Mar', x: 270, y: 326, tx: 244, ty: 330, ancla: 'end' },
  { nombre: 'Villa Gesell', x: 212, y: 412, tx: 168, ty: 456, ancla: 'middle' }
] as const;

export function Canchas() {
  const [activo, setActivo] = useState(LIGA.clubes[0]!.id);
  const sel = club(LIGA, activo);
  const proximos = LIGA.partidos.filter(p => p.estado !== 'jugado' && p.cancha === sel.estadio.nombre).slice(0, 2);
  return (
    <div className="pila" style={{ gap: 20 }}>
      <header className="titulo-pagina">
        <span className="etiqueta">13 canchas</span>
        <h1>Canchas</h1>
        <p>Tocá un escudo para ver la cancha y cómo llegar.</p>
      </header>
      <div className="grilla-2">
        <div className="mapa tarjeta">
          <svg viewBox="0 0 400 480" role="img" aria-label="Mapa esquemático de las canchas de la liga">
            <defs>
              <linearGradient id="mar" x1="0" x2="1">
                <stop offset="0" stopColor="#0f1a22" stopOpacity="0" />
                <stop offset="1" stopColor="#12324a" />
              </linearGradient>
            </defs>
            <path d="M400 20 C 382 120, 362 200, 342 270 S 300 385, 258 480 L400 480 Z" fill="url(#mar)" />
            <path d="M400 20 C 382 120, 362 200, 342 270 S 300 385, 258 480" fill="none" stroke="var(--arena)" strokeOpacity=".55" strokeWidth="2" strokeDasharray="2 5" />
            <text x="352" y="400" fill="var(--celeste)" fillOpacity=".55" fontSize="12" transform="rotate(-64 352 400)">Mar Argentino</text>
            <path d="M92 118 L 296 196" stroke="var(--linea-fuerte)" strokeWidth="2" strokeDasharray="6 5" fill="none" />
            <path d="M92 118 C 120 250, 170 360, 206 410" stroke="var(--linea-fuerte)" strokeWidth="2" strokeDasharray="6 5" fill="none" />
            <text x="196" y="172" fill="var(--apagado)" fontSize="10" transform="rotate(21 196 172)">Ruta 74</text>
            <text x="150" y="250" fill="var(--apagado)" fontSize="10" transform="rotate(66 150 250)">Ruta 11</text>
            {PUEBLOS.map(pb => (
              <text key={pb.nombre} x={pb.tx} y={pb.ty} textAnchor={pb.ancla} fill="var(--texto-2)" fontSize="11" fontWeight="700" letterSpacing=".08em">
                {pb.nombre.toUpperCase()}
              </text>
            ))}
            {PUEBLOS.flatMap(pb => {
              const del = LIGA.clubes.filter(c => c.localidad === pb.nombre);
              return del.map((c, i) => {
                const ang = (i / del.length) * Math.PI * 2 - Math.PI / 2;
                const r = del.length > 1 ? (del.length > 3 ? 34 : 24) : 0;
                const cx = pb.x + Math.cos(ang) * r;
                const cy = pb.y + Math.sin(ang) * r;
                return (
                  <g
                    key={c.id}
                    transform={`translate(${cx - 14} ${cy - 14})`}
                    className={`pin${c.id === activo ? ' activo' : ''}`}
                    onClick={() => setActivo(c.id)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setActivo(c.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={c.estadio.nombre}
                  >
                    <circle cx="14" cy="14" r="17" />
                    <image href={c.escudo} width="28" height="28" />
                  </g>
                );
              });
            })}
          </svg>
        </div>
        <div className="pila">
          <div className="tarjeta estadio-detalle" style={{ ['--club' as string]: sel.colores.primario }}>
            <Escudo id={sel.id} tam={48} />
            <div className="pila" style={{ gap: 4 }}>
              <span className="etiqueta">{sel.nombre}</span>
              <b style={{ fontSize: 20 }}>{sel.estadio.nombre}</b>
              <span className="texto-2">{sel.estadio.direccion}</span>
              <a
                className="boton primario"
                style={{ marginTop: 8, justifySelf: 'start' }}
                href={`https://www.google.com/maps/dir/?api=1&destination=${sel.estadio.lat},${sel.estadio.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                Cómo llegar
              </a>
            </div>
          </div>
          {proximos.length > 0 && (
            <>
              <span className="etiqueta">Próximos en esta cancha</span>
              <div className="lista">
                {proximos.map(p => (
                  <FilaPartido key={p.id} partido={p} />
                ))}
              </div>
            </>
          )}
          <div className="lista">
            {LIGA.clubes.map(c => (
              <button key={c.id} type="button" className={`resultado-busqueda${c.id === activo ? ' activo' : ''}`} onClick={() => setActivo(c.id)}>
                <Escudo id={c.id} tam={24} />
                <span className="pila" style={{ gap: 0, textAlign: 'left' }}>
                  <b>{c.estadio.nombre}</b>
                  <span className="texto-2">{c.localidad}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
