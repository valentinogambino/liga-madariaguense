import { useState } from 'react';
import { club, estadisticasJugador, jugador, partido } from '../data/consultas';
import { LIGA } from '../data/liga';
import { diaLargo, POSICIONES } from '../lib/formato';

// Tarjetas para compartir en Instagram o WhatsApp: se dibujan en un canvas de 1080 × 1350 (formato 4:5)
// y se comparten con el menú del celular o, si no está disponible, se descargan como PNG.

const ANCHO = 1080;
const ALTO = 1350;
const NUM = "800 {t}px 'Big Shoulders Display', Impact, sans-serif";
const TXT = "{w} {t}px 'Archivo', system-ui, sans-serif";
const f = (plantilla: string, t: number, w = 600) => plantilla.replace('{t}', String(t)).replace('{w}', String(w));

function cargar(src: string) {
  return new Promise<HTMLImageElement>((ok, mal) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = mal;
    img.src = src;
  });
}

function fondo(ctx: CanvasRenderingContext2D, a: string, b: string) {
  ctx.fillStyle = '#0b100d';
  ctx.fillRect(0, 0, ANCHO, ALTO);
  const g1 = ctx.createRadialGradient(0, 520, 0, 0, 520, 760);
  g1.addColorStop(0, `${a}66`);
  g1.addColorStop(1, `${a}00`);
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, ANCHO, ALTO);
  const g2 = ctx.createRadialGradient(ANCHO, 520, 0, ANCHO, 520, 760);
  g2.addColorStop(0, `${b}55`);
  g2.addColorStop(1, `${b}00`);
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, ANCHO, ALTO);
  // Líneas de cancha.
  ctx.strokeStyle = 'rgba(233,236,230,0.06)';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 60, ANCHO - 120, ALTO - 120);
  ctx.beginPath();
  ctx.moveTo(60, ALTO / 2);
  ctx.lineTo(ANCHO - 60, ALTO / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ANCHO / 2, ALTO / 2, 130, 0, Math.PI * 2);
  ctx.stroke();
}

async function pie(ctx: CanvasRenderingContext2D) {
  const logo = await cargar('/favicon.svg');
  ctx.drawImage(logo, 90, ALTO - 190, 60, 70);
  ctx.fillStyle = '#e9ece6';
  ctx.font = f(NUM, 40);
  ctx.textAlign = 'left';
  ctx.fillText('LIGA MADARIAGUENSE DE FÚTBOL', 170, ALTO - 150);
  ctx.fillStyle = '#8a958c';
  ctx.font = f(TXT, 24, 500);
  ctx.fillText('Datos de demostración', 170, ALTO - 116);
}

async function tarjetaPartido(id: string): Promise<HTMLCanvasElement> {
  const p = partido(LIGA, id)!;
  const L = club(LIGA, p.local);
  const V = club(LIGA, p.visitante);
  const c = document.createElement('canvas');
  c.width = ANCHO;
  c.height = ALTO;
  const ctx = c.getContext('2d')!;
  fondo(ctx, L.colores.primario, V.colores.primario);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d8c39b';
  ctx.font = f(TXT, 30, 700);
  const titulo = p.torneo === 'Final' ? `FINAL ${p.temporada}` : `${p.torneo.toUpperCase()} ${p.temporada} · FECHA ${p.fecha}`;
  ctx.fillText(titulo, ANCHO / 2, 190);
  ctx.fillStyle = '#e9ece6';
  ctx.font = f(NUM, 120);
  ctx.fillText('RESULTADO', ANCHO / 2, 320);
  const [eL, eV] = await Promise.all([cargar(L.escudo), cargar(V.escudo)]);
  ctx.drawImage(eL, 120, 440, 260, 260);
  ctx.drawImage(eV, ANCHO - 380, 440, 260, 260);
  ctx.font = f(NUM, 240);
  ctx.fillText(`${p.goles!.local}-${p.goles!.visitante}`, ANCHO / 2, 660);
  ctx.font = f(TXT, 34, 700);
  ctx.fillText(L.nombre, 250, 770);
  ctx.fillText(V.nombre, ANCHO - 250, 770);
  const goles = p.eventos.filter(e => e.tipo === 'gol' || e.tipo === 'penal' || e.tipo === 'en-contra');
  ctx.font = f(TXT, 28, 500);
  ctx.fillStyle = '#b5beb6';
  const col = (lado: string, x: number) =>
    goles
      .filter(e => e.club === lado)
      .slice(0, 6)
      .forEach((e, i) => ctx.fillText(`${jugador(LIGA, e.jugador)?.apellido ?? ''} ${e.minuto}'`, x, 830 + i * 40));
  col(L.id, 250);
  col(V.id, ANCHO - 250);
  ctx.fillStyle = '#8a958c';
  ctx.font = f(TXT, 26, 500);
  ctx.fillText(`${p.cancha} · ${diaLargo(p.dia)}`, ANCHO / 2, 1110);
  await pie(ctx);
  return c;
}

async function tarjetaJugador(id: string): Promise<HTMLCanvasElement> {
  const j = jugador(LIGA, id)!;
  const C = club(LIGA, j.club);
  const e = estadisticasJugador(LIGA, id, LIGA.ahora.temporada);
  const c = document.createElement('canvas');
  c.width = ANCHO;
  c.height = ALTO;
  const ctx = c.getContext('2d')!;
  fondo(ctx, C.colores.primario, C.colores.secundario);
  const escudo = await cargar(C.escudo);
  ctx.globalAlpha = 0.12;
  ctx.drawImage(escudo, ANCHO - 620, 120, 560, 560);
  ctx.globalAlpha = 1;
  ctx.drawImage(escudo, 90, 130, 120, 120);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#d8c39b';
  ctx.font = f(TXT, 30, 700);
  ctx.fillText(`${C.nombre.toUpperCase()} · ${POSICIONES[j.posicion].toUpperCase()}`, 90, 320);
  ctx.fillStyle = '#e9ece6';
  ctx.font = f(NUM, 300);
  ctx.fillText(String(j.dorsal), 80, 600);
  ctx.font = f(NUM, 110);
  ctx.fillText(j.nombre.toUpperCase(), 90, 730);
  ctx.fillText(j.apellido.toUpperCase(), 90, 840);
  const datos: [string, number][] = [['PJ', e.pj], ['GOLES', e.goles], ['ASIST.', e.asistencias], ['AMAR.', e.amarillas]];
  datos.forEach(([k, v], i) => {
    const x = 90 + i * 235;
    ctx.fillStyle = '#e9ece6';
    ctx.font = f(NUM, 120);
    ctx.fillText(String(v), x, 1010);
    ctx.fillStyle = '#8a958c';
    ctx.font = f(TXT, 26, 700);
    ctx.fillText(k, x + 4, 1050);
  });
  ctx.fillStyle = '#8a958c';
  ctx.font = f(TXT, 26, 500);
  ctx.fillText(`Temporada ${LIGA.ahora.temporada}`, 90, 1100);
  await pie(ctx);
  return c;
}

export function BotonCompartir({ tipo, id }: { tipo: 'partido' | 'jugador'; id: string }) {
  const [estado, setEstado] = useState<'listo' | 'armando' | 'hecho' | 'error'>('listo');
  const compartir = async () => {
    setEstado('armando');
    try {
      await document.fonts.ready;
      const canvas = tipo === 'partido' ? await tarjetaPartido(id) : await tarjetaJugador(id);
      const blob = await new Promise<Blob>((ok, mal) => canvas.toBlob(b => (b ? ok(b) : mal(new Error('sin imagen'))), 'image/png'));
      const archivo = new File([blob], `lmf-${tipo}-${id}.png`, { type: 'image/png' });
      const descargar = () => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = archivo.name;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      };
      if (navigator.canShare?.({ files: [archivo] })) {
        try {
          await navigator.share({ files: [archivo], title: 'Liga Madariaguense de Fútbol' });
        } catch (err) {
          // Cancelar el menú no es un error; si el navegador no deja compartir, se descarga.
          if ((err as Error).name === 'AbortError') {
            setEstado('listo');
            return;
          }
          descargar();
        }
      } else descargar();
      setEstado('hecho');
    } catch (err) {
      console.error('No se pudo armar la imagen para compartir', err);
      setEstado('error');
    }
    window.setTimeout(() => setEstado('listo'), 2500);
  };
  const texto = { listo: 'Compartir imagen', armando: 'Armando la imagen…', hecho: 'Imagen lista', error: 'No se pudo armar' }[estado];
  return (
    <button type="button" className="boton primario" onClick={compartir} disabled={estado === 'armando'}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" />
      </svg>
      {texto}
    </button>
  );
}
