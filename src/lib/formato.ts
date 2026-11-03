// Formatos de fecha y texto en español rioplatense. Las fechas del modelo son locales («2026-11-01T15:30»).

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function partes(iso: string) {
  const [f, h = '00:00'] = iso.split('T');
  const [a, m, d] = (f ?? '').split('-').map(Number);
  const fecha = new Date(Date.UTC(a!, m! - 1, d!));
  return { anio: a!, mes: m!, dia: d!, hora: h.slice(0, 5), semana: fecha.getUTCDay() };
}

export const hora = (iso: string) => partes(iso).hora;
export const diaCorto = (iso: string) => {
  const p = partes(iso);
  return `${DIAS_CORTOS[p.semana]} ${p.dia}/${p.mes}`;
};
export const diaLargo = (iso: string) => {
  const p = partes(iso);
  const texto = `${DIAS[p.semana]} ${p.dia} de ${MESES[p.mes - 1]}`;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};
export const fechaCompleta = (iso: string) => {
  const p = partes(iso);
  return `${p.dia} de ${MESES[p.mes - 1]} de ${p.anio}`;
};
export const edad = (nacimiento: string, hoy = '2026-11-01') => {
  const n = partes(nacimiento);
  const h = partes(hoy);
  return h.anio - n.anio - (h.mes < n.mes || (h.mes === n.mes && h.dia < n.dia) ? 1 : 0);
};
export const POSICIONES = { ARQ: 'Arquero', DEF: 'Defensor', MED: 'Mediocampista', DEL: 'Delantero' } as const;
export const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
