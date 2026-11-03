import { gsap } from 'gsap';
import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router';
import { TarjetaEnVivo } from '../componentes/EnVivo';
import { Escudo } from '../componentes/Escudo';
import { FilaPartido, SeccionCab, TablaPosiciones } from '../componentes/Partidos';
import { Silueta } from '../componentes/Silueta';
import {
  club, fechaActual, goleadores, libreDe, nombreJugador, tabla, ultimaFechaJugada
} from '../data/consultas';
import { LIGA } from '../data/liga';
import { diaLargo } from '../lib/formato';

export function Inicio() {
  const raiz = useRef<HTMLDivElement>(null);
  const { temporada, torneo, fecha } = LIGA.ahora;
  const ultima = ultimaFechaJugada(LIGA);
  const actual = fechaActual(LIGA).filter(p => p.estado !== 'en-vivo');
  const posiciones = tabla(LIGA, temporada, 'Clausura');
  const goles = goleadores(LIGA, temporada, torneo, 5);
  const campeon = LIGA.campeonAperturaActual;
  const libre = libreDe(LIGA, temporada, torneo, fecha);
  const lider = goles[0];

  // Entrada orquestada: un solo momento al cargar, escalonado de arriba hacia abajo.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-entra]', { y: 18, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, clearProps: 'all' });
    });
    return () => mm.revert();
  }, []);

  return (
    <div ref={raiz} className="pila inicio" style={{ gap: 32 }}>
      <section className="pila" data-entra>
        <h1 className="sr">Liga Madariaguense de Fútbol</h1>
        <TarjetaEnVivo />
      </section>

      <div className="grilla-2">
        <div className="pila" style={{ gap: 32 }}>
          <section className="pila" data-entra>
            <SeccionCab titulo={`Fecha ${fecha} · en juego`} enlace={`/fixture?fecha=${fecha}`} texto="Fixture" />
            <div className="lista">
              {actual.map(p => (
                <FilaPartido key={p.id} partido={p} />
              ))}
            </div>
            {libre && (
              <p className="nota-libre">
                <Escudo id={libre} tam={18} /> Libre: {club(LIGA, libre).nombre}
              </p>
            )}
          </section>

          <section className="pila" data-entra>
            <SeccionCab titulo={`Resultados · Fecha ${fecha - 1}`} enlace={`/fixture?fecha=${fecha - 1}`} />
            <div className="lista">
              {ultima.map(p => (
                <FilaPartido key={p.id} partido={p} />
              ))}
            </div>
            {ultima[0] && <p className="nota-libre">Se jugó el fin de semana del {diaLargo(ultima[0].dia).toLowerCase()}.</p>}
          </section>
        </div>

        <div className="pila" style={{ gap: 32 }}>
          <section className="pila" data-entra>
            <SeccionCab titulo="Posiciones" enlace="/posiciones" texto="Tabla completa" />
            <div className="tarjeta" style={{ padding: '6px 4px' }}>
              <TablaPosiciones filas={posiciones.slice(0, 5)} resumida />
            </div>
          </section>

          {lider && (
            <section className="pila" data-entra>
              <SeccionCab titulo="Goleadores" enlace="/estadisticas" texto="Estadísticas" />
              <div className="goleadores">
                <Link to={`/jugadores/${lider.jugador.id}`} className="goleador-lider" style={{ ['--club' as string]: club(LIGA, lider.jugador.club).colores.primario }}>
                  <Silueta clubId={lider.jugador.club} dorsal={lider.jugador.dorsal} tam={84} />
                  <span className="pila" style={{ gap: 2 }}>
                    <span className="etiqueta">Máximo goleador del Clausura</span>
                    <b>{nombreJugador(lider.jugador)}</b>
                    <span className="gl-club">
                      <Escudo id={lider.jugador.club} tam={16} /> {club(LIGA, lider.jugador.club).corto}
                    </span>
                  </span>
                  <span className="gl-num num">{lider.valor}</span>
                </Link>
                <ol className="lista goleadores-lista" start={2}>
                  {goles.slice(1).map((g, i) => (
                    <li key={g.jugador.id}>
                      <Link to={`/jugadores/${g.jugador.id}`}>
                        <span className="num gl-pos">{i + 2}</span>
                        <Escudo id={g.jugador.club} tam={20} />
                        <span className="gl-nombre">{nombreJugador(g.jugador)}</span>
                        <span className="num gl-valor">{g.valor}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {campeon && (
            <Link to={`/clubes/${campeon}`} className="banda-campeon" data-entra style={{ ['--club' as string]: club(LIGA, campeon).colores.primario }}>
              <Escudo id={campeon} tam={48} />
              <span className="pila" style={{ gap: 2 }}>
                <span className="etiqueta">Campeón del Apertura {temporada}</span>
                <b>{club(LIGA, campeon).nombre}</b>
                <span className="texto-2">Juega la final ante el ganador del Clausura.</span>
              </span>
            </Link>
          )}

          <Link to="/sanciones" className="banda-aviso" data-entra>
            <span className="tarjeta-roja" aria-hidden="true" />
            <span>
              <b>{LIGA.sanciones.length} suspendidos</b> para la fecha {fecha + 1}
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
