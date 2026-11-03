import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Marcador } from './Marcador';

const PRINCIPALES = [
  { a: '/', texto: 'Inicio', icono: 'M3 11 12 4l9 7v9h-6v-6H9v6H3z' },
  { a: '/fixture', texto: 'Fixture', icono: 'M4 5h16v15H4zM4 9h16M8 3v4M16 3v4' },
  { a: '/posiciones', texto: 'Tabla', icono: 'M4 6h16M4 12h16M4 18h16M8 4v16' },
  { a: '/clubes', texto: 'Clubes', icono: 'M5 4h14v8c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9z' }
];

const MAS = [
  { a: '/estadisticas', texto: 'Estadísticas', detalle: 'Goleadores, asistencias, tarjetas, vallas' },
  { a: '/sanciones', texto: 'Suspendidos', detalle: 'Quién no juega la próxima fecha' },
  { a: '/comparar', texto: 'Cara a cara', detalle: 'Historial y números entre dos clubes' },
  { a: '/canchas', texto: 'Canchas', detalle: 'Dónde se juega y cómo llegar' },
  { a: '/la-liga', texto: 'La liga', detalle: 'Historia y campeones desde 1990' },
  { a: '/buscar', texto: 'Buscar', detalle: 'Jugadores, clubes y partidos' }
];

function Icono({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Marca() {
  return (
    <Link to="/" className="marca" aria-label="Liga Madariaguense de Fútbol, inicio">
      <img src="/favicon.svg" alt="" width="30" height="35" />
      <span>
        <b>Liga Madariaguense</b>
        <small>de Fútbol · Primera</small>
      </span>
    </Link>
  );
}

function Cabecera() {
  return (
    <header className="cabecera">
      <div className="contenedor cabecera-fila">
        <Marca />
        <nav className="nav-escritorio" aria-label="Secciones">
          {[...PRINCIPALES, ...MAS.slice(0, 5)].map(l => (
            <NavLink key={l.a} to={l.a} end={l.a === '/'}>
              {l.texto}
            </NavLink>
          ))}
        </nav>
        <Link to="/buscar" className="boton-icono" aria-label="Buscar">
          <Icono d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4" />
        </Link>
      </div>
    </header>
  );
}

function NavInferior() {
  const [abierto, setAbierto] = useState(false);
  const reducido = useReducedMotion();
  const { pathname } = useLocation();
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);
  useEffect(() => {
    if (!abierto) return undefined;
    const cerrar = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    window.addEventListener('keydown', cerrar);
    return () => window.removeEventListener('keydown', cerrar);
  }, [abierto]);
  const enMas = MAS.some(l => pathname.startsWith(l.a));
  return (
    <>
      <AnimatePresence>
        {abierto && (
          <>
            <motion.div
              className="velo"
              onClick={() => setAbierto(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="hoja-mas"
              role="dialog"
              aria-label="Más secciones"
              initial={reducido ? { opacity: 0 } : { y: '100%' }}
              animate={reducido ? { opacity: 1 } : { y: 0 }}
              exit={reducido ? { opacity: 0 } : { y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            >
              <span className="hoja-agarre" aria-hidden="true" />
              {MAS.map(l => (
                <Link key={l.a} to={l.a} className="hoja-item">
                  <b>{l.texto}</b>
                  <span>{l.detalle}</span>
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <nav className="nav-inferior" aria-label="Secciones principales">
        {PRINCIPALES.map(l => (
          <NavLink key={l.a} to={l.a} end={l.a === '/'}>
            <Icono d={l.icono} />
            <span>{l.texto}</span>
          </NavLink>
        ))}
        <button type="button" aria-expanded={abierto} className={enMas ? 'active' : undefined} onClick={() => setAbierto(a => !a)}>
          <Icono d="M5 12h.01M12 12h.01M19 12h.01" />
          <span>Más</span>
        </button>
      </nav>
    </>
  );
}

function Pie() {
  return (
    <footer className="pie">
      <div className="contenedor pie-fila">
        <div className="pila">
          <Marca />
          <p>General Madariaga · Pinamar · Ostende · Valeria del Mar · Villa Gesell</p>
        </div>
        <p className="aviso-demo">
          <b>Datos de demostración.</b> Clubes, localidades y escudos son reales; jugadores, resultados, estadísticas,
          palmarés e historia son inventados.
        </p>
      </div>
    </footer>
  );
}

export function Estructura({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return (
    <>
      <div className="arriba">
        <Marcador />
        <Cabecera />
      </div>
      <main className="contenedor" id="contenido">
        {children ?? <Outlet />}
      </main>
      <Pie />
      <NavInferior />
    </>
  );
}
