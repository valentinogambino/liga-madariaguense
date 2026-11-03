import { Link } from 'react-router';
import { tabla, temporadas } from '../data/consultas';
import { LIGA } from '../data/liga';
import type { ClubId } from '../data/tipos';
import { SeccionCab } from './Partidos';

// Campañas del club temporada por temporada: puesto en cada torneo y títulos.
export function Campanas({ clubId }: { clubId: ClubId }) {
  const filas = temporadas(LIGA)
    .map(t => {
      const ap = tabla(LIGA, t, 'Apertura');
      const cl = tabla(LIGA, t, 'Clausura');
      const pa = ap.findIndex(f => f.club === clubId) + 1;
      const pc = cl.findIndex(f => f.club === clubId) + 1;
      const campeon = LIGA.campeones.find(c => c.anio === t)?.campeon === clubId;
      return { t, pa, pc, n: ap.length, campeon, enCurso: t === LIGA.ahora.temporada };
    })
    .filter(f => f.pa > 0);
  return (
    <section className="pila">
      <SeccionCab titulo="Campañas" texto={`Desde ${filas.at(-1)?.t ?? ''}`} />
      <div className="tarjeta campanas">
        <table className="tabla">
          <thead>
            <tr>
              <th scope="col">Año</th>
              <th scope="col">Apertura</th>
              <th scope="col">Clausura</th>
              <th scope="col" className="t-club" />
            </tr>
          </thead>
          <tbody>
            {filas.map(f => (
              <tr key={f.t} className={f.campeon ? 'resaltada' : undefined}>
                <td className="num">
                  <Link to={`/posiciones?temporada=${f.t}`}>{f.t}</Link>
                </td>
                <td className={f.pa === 1 ? 'puesto-uno' : undefined}>
                  {f.pa}° <span className="texto-2">/ {f.n}</span>
                </td>
                <td className={f.pc === 1 && !f.enCurso ? 'puesto-uno' : undefined}>
                  {f.pc}°{f.enCurso ? <span className="texto-2"> (en juego)</span> : <span className="texto-2"> / {f.n}</span>}
                </td>
                <td className="t-club">{f.campeon ? '🏆 Campeón' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
