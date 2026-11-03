import { BrowserRouter, Route, Routes } from 'react-router';
import { Estructura } from './componentes/Estructura';
import { ProveedorEnVivo } from './lib/enVivo';
import { Club } from './paginas/Club';
import { Clubes } from './paginas/Clubes';
import { Comparar } from './paginas/Comparar';
import { Fixture } from './paginas/Fixture';
import { Inicio } from './paginas/Inicio';
import { Jugador } from './paginas/Jugador';
import { NoEncontrada } from './paginas/NoEncontrada';
import { Partido } from './paginas/Partido';
import { Posiciones } from './paginas/Posiciones';
import { Buscar, Canchas, Estadisticas, LaLiga, Sanciones } from './paginas/Varias';

export function App() {
  return (
    <BrowserRouter>
      <ProveedorEnVivo>
        <Routes>
          <Route element={<Estructura />}>
            <Route index element={<Inicio />} />
            <Route path="fixture" element={<Fixture />} />
            <Route path="partido/:id" element={<Partido />} />
            <Route path="posiciones" element={<Posiciones />} />
            <Route path="clubes" element={<Clubes />} />
            <Route path="clubes/:id" element={<Club />} />
            <Route path="jugadores/:id" element={<Jugador />} />
            <Route path="comparar" element={<Comparar />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="sanciones" element={<Sanciones />} />
            <Route path="la-liga" element={<LaLiga />} />
            <Route path="buscar" element={<Buscar />} />
            <Route path="canchas" element={<Canchas />} />
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Routes>
      </ProveedorEnVivo>
    </BrowserRouter>
  );
}
