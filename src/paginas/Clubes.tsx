import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { Escudo } from '../componentes/Escudo';
import { tabla, titulosPorClub } from '../data/consultas';
import { LIGA } from '../data/liga';

export function Clubes() {
  const reducido = useReducedMotion();
  const posiciones = tabla(LIGA, LIGA.ahora.temporada, 'Clausura');
  const titulos = new Map(titulosPorClub(LIGA).map(t => [t.club, t.anios.length]));
  const localidades = [...new Set(LIGA.clubes.map(c => c.localidad))];
  return (
    <div className="pila" style={{ gap: 16 }}>
      <header className="titulo-pagina">
        <span className="etiqueta">13 clubes · 5 localidades</span>
        <h1>Clubes</h1>
      </header>
      {localidades.map(loc => (
        <section key={loc} className="pila" style={{ gap: 8 }}>
          <h2 className="etiqueta localidad-cab">{loc}</h2>
          <div className="grilla-clubes">
            {LIGA.clubes
              .filter(c => c.localidad === loc)
              .map((c, i) => {
                const pos = posiciones.findIndex(f => f.club === c.id) + 1;
                const n = titulos.get(c.id) ?? 0;
                return (
                  <motion.div
                    key={c.id}
                    initial={reducido ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                    transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link to={`/clubes/${c.id}`} className="club-tarjeta" style={{ ['--club' as string]: c.colores.primario }}>
                      <Escudo id={c.id} tam={44} />
                      <b>{c.nombre}</b>
                      <span className="club-datos">
                        <span>
                          <b className="num">{pos}°</b> Clausura
                        </span>
                        <span>
                          <b className="num">{n}</b> {n === 1 ? 'título' : 'títulos'}
                        </span>
                        <span>Fund. {c.fundacion}</span>
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
