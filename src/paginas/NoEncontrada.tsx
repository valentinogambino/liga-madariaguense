import { Link } from 'react-router';

export function NoEncontrada() {
  return (
    <div className="titulo-pagina" style={{ paddingBlock: 48 }}>
      <span className="etiqueta">Error 404</span>
      <h1>Fuera de juego</h1>
      <p>Esta página no existe o cambió de lugar.</p>
      <p>
        <Link to="/" className="boton primario" style={{ marginTop: 12 }}>
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
