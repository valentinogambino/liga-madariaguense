import { gsap } from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { BotonCompartir } from '../componentes/Compartir';
import { Escudo } from '../componentes/Escudo';
import { SeccionCab } from '../componentes/Partidos';
import { Silueta } from '../componentes/Silueta';
import { club, estadisticasJugador, estadisticasPorTemporada, jugador, partidosDeClub } from '../data/consultas';
import { LIGA } from '../data/liga';
import { diaCorto, edad, fechaCompleta, POSICIONES } from '../lib/formato';
import { NoEncontrada } from './NoEncontrada';

export function Jugador() {
  const { id = '' } = useParams();
  const j = jugador(LIGA, id);
  if (!j) return <NoEncontrada />;
  return <FichaJugador key={j.id} id={j.id} />;
}

function FichaJugador({ id }: { id: string }) {
  const j = jugador(LIGA, id)!;
  const c = club(LIGA, j.club);
  const t = LIGA.ahora.temporada;
  const e = estadisticasJugador(LIGA, id, t);
  const total = estadisticasJugador(LIGA, id);
  const porTemporada = estadisticasPorTemporada(LIGA, id);
  const raiz = useRef<HTMLDivElement>(null);

  // Títulos: campeonatos de los clubes en los años que estuvo en cada uno.
  const titulos = LIGA.campeones.filter(cp =>
    j.trayectoria.some(p => p.club === cp.campeon && cp.anio >= p.desde && cp.anio <= (p.hasta ?? t))
  );
  if (LIGA.campeonAperturaActual === j.club) titulos.push({ anio: t, campeon: j.club, subcampeon: j.club });

  const partidos = partidosDeClub(LIGA, j.club, t)
    .filter(p => p.formaciones && [...p.formaciones.local.titulares, ...p.formaciones.visitante.titulares, ...p.eventos.filter(x => x.tipo === 'cambio').map(x => x.jugador)].includes(id))
    .sort((a, b) => b.dia.localeCompare(a.dia))
    .slice(0, 6);

  const sinIngresar = e.suplenteSinIngresar;
  const convocado = e.titular + e.suplenteIngresado + sinIngresar || 1;

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.jh-dorsal', { x: -40, opacity: 0, duration: 0.8 })
        .from('.jh-silueta', { y: 30, opacity: 0, duration: 0.7 }, '<0.1')
        .from('.jh-texto > *', { y: 14, opacity: 0, stagger: 0.06, duration: 0.5 }, '<0.15')
        .from('.cifra-grande b', { textContent: 0, snap: { textContent: 1 }, duration: 0.9, stagger: 0.05 }, '<');
    }, raiz);
    return () => mm.revert();
  }, []);

  return (
    <div ref={raiz} className="pila" style={{ gap: 28, ['--club' as string]: c.colores.primario, ['--club-2' as string]: c.colores.secundario }}>
      <header className="jugador-hero">
        <span className="jh-dorsal num" aria-hidden="true">
          {j.dorsal}
        </span>
        <div className="jh-silueta">
          <Silueta clubId={j.club} dorsal={j.dorsal} tam={150} />
        </div>
        <div className="jh-texto pila" style={{ gap: 6 }}>
          <Link to={`/clubes/${c.id}`} className="jh-club">
            <Escudo id={c.id} tam={22} /> {c.nombre}
          </Link>
          <h1>
            <span>{j.nombre}</span> {j.apellido}
          </h1>
          <span className="etiqueta">
            {POSICIONES[j.posicion]} · Camiseta {j.dorsal}
            {j.apodo ? ` · «${j.apodo}»` : ''}
          </span>
        </div>
      </header>

      <dl className="datos-partido">
        <div>
          <dt>Edad</dt>
          <dd>{edad(j.nacimiento)} años</dd>
        </div>
        <div>
          <dt>Nacimiento</dt>
          <dd>
            {fechaCompleta(j.nacimiento)}, {j.lugarNacimiento}
          </dd>
        </div>
        <div>
          <dt>Nacionalidad</dt>
          <dd>{j.nacionalidad}</dd>
        </div>
      </dl>

      <div className="acciones">
        <BotonCompartir tipo="jugador" id={j.id} />
      </div>

      <div className="grilla-2">
        <div className="pila" style={{ gap: 28 }}>
          <section className="pila">
            <SeccionCab titulo={`Temporada ${t}`} />
            <div className="cifras grandes">
              {([['Partidos', e.pj], ['Goles', e.goles], ['Asistencias', e.asistencias], ['Minutos', e.minutos]] as const).map(([k, v]) => (
                <div key={k} className="cifra cifra-grande">
                  <b className="num">{v}</b>
                  <span>{k}</span>
                </div>
              ))}
            </div>
            <div className="cifras">
              <div className="cifra">
                <b className="num">
                  <span className="tarjeta-amarilla" /> {e.amarillas}
                </b>
                <span>Amarillas</span>
              </div>
              <div className="cifra">
                <b className="num">
                  <span className="tarjeta-roja" /> {e.rojas}
                </b>
                <span>Rojas</span>
              </div>
            </div>
            <div className="reparto" aria-label="Cómo fue convocado">
              <div className="reparto-barra">
                <span style={{ flex: e.titular, background: 'var(--arena)' }} />
                <span style={{ flex: e.suplenteIngresado, background: 'var(--celeste)' }} />
                <span style={{ flex: sinIngresar, background: 'var(--superficie-3)' }} />
              </div>
              <div className="reparto-ref">
                <span>
                  <i style={{ background: 'var(--arena)' }} /> Titular {e.titular}
                </span>
                <span>
                  <i style={{ background: 'var(--celeste)' }} /> Entró desde el banco {e.suplenteIngresado}
                </span>
                <span>
                  <i style={{ background: 'var(--superficie-3)' }} /> Banco sin ingresar {sinIngresar}
                </span>
              </div>
              <span className="sr">{Math.round((e.titular / convocado) * 100)}% de titular</span>
            </div>
          </section>

          {partidos.length > 0 && (
            <section className="pila">
              <SeccionCab titulo="Últimos partidos" />
              <div className="lista">
                {partidos.map(p => {
                  const rival = p.local === j.club ? p.visitante : p.local;
                  const g = p.eventos.filter(x => x.jugador === id && (x.tipo === 'gol' || x.tipo === 'penal')).length;
                  const am = p.eventos.some(x => x.jugador === id && x.tipo === 'amarilla');
                  const ro = p.eventos.some(x => x.jugador === id && x.tipo === 'roja');
                  const nuestro = p.local === j.club ? p.goles?.local : p.goles?.visitante;
                  const suyo = p.local === j.club ? p.goles?.visitante : p.goles?.local;
                  return (
                    <Link key={p.id} to={`/partido/${p.id}`} className="partido-jugador">
                      <span className="texto-2">{diaCorto(p.dia)}</span>
                      <span className="pj-rival">
                        {p.local === j.club ? 'vs' : 'en'} <Escudo id={rival} tam={20} /> {club(LIGA, rival).corto}
                      </span>
                      <span className="pj-marcas">
                        {'⚽'.repeat(g)}
                        {am && <span className="tarjeta-amarilla" />}
                        {ro && <span className="tarjeta-roja" />}
                      </span>
                      <span className="num pj-res">
                        {nuestro}-{suyo}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div className="pila" style={{ gap: 28 }}>
          <section className="pila">
            <SeccionCab titulo="Historial de clubes" />
            <ol className="trayectoria">
              {[...j.trayectoria].reverse().map(p => (
                <li key={`${p.club}-${p.desde}`} style={{ ['--c' as string]: club(LIGA, p.club).colores.primario }}>
                  <Escudo id={p.club} tam={30} />
                  <span className="pila" style={{ gap: 0 }}>
                    <Link to={`/clubes/${p.club}`}>
                      <b>{club(LIGA, p.club).nombre}</b>
                    </Link>
                    <span className="texto-2">
                      {p.desde}–{p.hasta ?? 'hoy'}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="pila">
            <SeccionCab titulo="Por temporada" />
            <div className="tarjeta" style={{ padding: '2px 4px' }}>
              <table className="tabla">
                <thead>
                  <tr>
                    <th scope="col">Año</th>
                    <th scope="col" className="t-club">Club</th>
                    <th scope="col">PJ</th>
                    <th scope="col">G</th>
                    <th scope="col">A</th>
                    <th scope="col" aria-label="Amarillas"><span className="tarjeta-amarilla" /></th>
                    <th scope="col" aria-label="Rojas"><span className="tarjeta-roja" /></th>
                  </tr>
                </thead>
                <tbody>
                  {porTemporada.map(r => (
                    <tr key={r.temporada}>
                      <td className="num">{r.temporada}</td>
                      <td className="t-club">{r.club ? club(LIGA, r.club).corto : '—'}</td>
                      <td>{r.e.pj}</td>
                      <td>{r.e.goles}</td>
                      <td>{r.e.asistencias}</td>
                      <td>{r.e.amarillas}</td>
                      <td>{r.e.rojas}</td>
                    </tr>
                  ))}
                  <tr className="resaltada">
                    <td colSpan={2} className="t-club">
                      <b>Total en la liga</b>
                    </td>
                    <td>{total.pj}</td>
                    <td>{total.goles}</td>
                    <td>{total.asistencias}</td>
                    <td>{total.amarillas}</td>
                    <td>{total.rojas}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="pila">
            <SeccionCab titulo="Títulos" />
            {titulos.length ? (
              <ul className="titulos">
                {titulos.map(tt => (
                  <li key={`${tt.anio}-${tt.campeon}`}>
                    <span aria-hidden="true">🏆</span>
                    <span>
                      {tt.anio === t ? `Apertura ${t}` : `Primera ${tt.anio}`} con {club(LIGA, tt.campeon).corto}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="texto-2">Todavía sin títulos en la liga.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
