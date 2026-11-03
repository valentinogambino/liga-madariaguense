import type { ClubId } from './tipos';

// Material para inventar personas y reseñas. Todo es ficticio.

export const NOMBRES = [
  'Agustín', 'Alan', 'Alejo', 'Axel', 'Benjamín', 'Bruno', 'Camilo', 'Cristian', 'Damián', 'Dante', 'Diego',
  'Emanuel', 'Emiliano', 'Enzo', 'Ezequiel', 'Facundo', 'Federico', 'Franco', 'Gabriel', 'Gastón', 'Gonzalo',
  'Hernán', 'Ignacio', 'Iván', 'Joaquín', 'Jonathan', 'Juan Cruz', 'Julián', 'Kevin', 'Lautaro', 'Leandro',
  'Lucas', 'Luciano', 'Marcos', 'Martín', 'Matías', 'Mauro', 'Maximiliano', 'Nahuel', 'Nicolás', 'Pablo',
  'Ramiro', 'Rodrigo', 'Santiago', 'Sebastián', 'Thiago', 'Tobías', 'Tomás', 'Valentín', 'Walter', 'Brian',
  'Claudio', 'Darío', 'Elías', 'Fernando', 'Germán', 'Hugo', 'Jeremías', 'Leonel', 'Marcelo', 'Mateo',
  'Néstor', 'Óscar', 'Patricio', 'Rubén', 'Sergio', 'Uriel', 'Víctor', 'Lisandro', 'Ciro', 'Bautista'
] as const;

export const APELLIDOS = [
  'Acosta', 'Aguirre', 'Alvarado', 'Arrieta', 'Ayala', 'Barrios', 'Benítez', 'Bustos', 'Cabrera', 'Cáceres',
  'Calvo', 'Campos', 'Cardozo', 'Castro', 'Correa', 'Coronel', 'Díaz', 'Domínguez', 'Echeverría', 'Escobar',
  'Fernández', 'Ferreyra', 'Figueroa', 'Funes', 'Galarza', 'Giménez', 'Godoy', 'Gómez', 'González', 'Gutiérrez',
  'Herrera', 'Ibáñez', 'Iriarte', 'Juárez', 'Ledesma', 'Lescano', 'Luna', 'Maidana', 'Medina', 'Méndez',
  'Miranda', 'Molina', 'Montenegro', 'Moreno', 'Muñoz', 'Navarro', 'Núñez', 'Ojeda', 'Olivera', 'Ortiz',
  'Pacheco', 'Paz', 'Peralta', 'Pereyra', 'Ponce', 'Quiroga', 'Ramírez', 'Ríos', 'Rivero', 'Rojas', 'Romero',
  'Ruiz', 'Salinas', 'Sánchez', 'Sosa', 'Suárez', 'Tévez', 'Toledo', 'Torres', 'Valdez', 'Vázquez', 'Vega',
  'Villalba', 'Zalazar', 'Zárate', 'Larrañaga', 'Etcheverry', 'Irigoyen', 'Bianchi', 'Lombardi', 'Rossi',
  'Ferraro', 'Garay', 'Bordenave', 'Insaurralde', 'Mansilla', 'Arregui', 'Goñi', 'Urquiza', 'Olmedo', 'Soria',
  'Lucero', 'Amaya', 'Brizuela', 'Carrizo', 'Duarte', 'Espíndola', 'Frías', 'Gauna', 'Heredia', 'Leiva'
] as const;

export const APODOS = [
  'Chino', 'Pato', 'Tano', 'Colo', 'Ruso', 'Negro', 'Flaco', 'Pipa', 'Toto', 'Chueco', 'Pitu', 'Polaco', 'Mono',
  'Laucha', 'Turco', 'Cabezón', 'Gringo', 'Pela', 'Tito', 'Fideo'
] as const;

export const LUGARES = [
  ['General Madariaga', 34],
  ['Pinamar', 16],
  ['Villa Gesell', 18],
  ['Mar del Plata', 10],
  ['Dolores', 5],
  ['Maipú', 4],
  ['Mar de Ajó', 4],
  ['Balcarce', 3],
  ['Buenos Aires', 6]
] as const;

export const EXTRANJEROS = [
  ['Montevideo', 'Uruguay'],
  ['Asunción', 'Paraguay'],
  ['Santa Cruz de la Sierra', 'Bolivia'],
  ['Salto', 'Uruguay'],
  ['Encarnación', 'Paraguay']
] as const;

export const ARBITROS = [
  'Héctor Ibarguren', 'Miguel Á. Sarasola', 'Claudio Pereda', 'Ricardo Alzaga', 'Jorge Lamarque',
  'Daniel Urrutia', 'Fabián Ocampo', 'Raúl Barreneche', 'Sergio Lasalle', 'Gustavo Echenique'
] as const;

// Reseñas inventadas (2 o 3 párrafos). La fundación coincide con la de clubes.ts.
export const HISTORIAS: Record<ClubId, string> = {
  cosme:
    'Atlético Cosme nació en 1921 en un galpón ferroviario de General Madariaga, cuando un grupo de peones de campo juntó plata para comprar una pelota de tiento. El nombre homenajea a Cosme Larrea, el almacenero que les prestó el primer terreno.\n\nEl verde y el rojo salieron de las únicas dos camisetas que se conseguían en el pueblo. Desde entonces es el club más ganador de la liga y protagonista del clásico madariaguense contra Racing, que todavía hoy llena las dos tribunas.',
  leon:
    'Deportivo El León se fundó en 1978 en el barrio sur de Madariaga, a partir de un equipo de fútbol de los viernes que se negó a disolverse. El apodo vino de su primer capitán, un marcador central famoso por gritar más fuerte que nadie.\n\nCon pocos recursos y mucho trabajo de sus socios, armó una cancha propia en los años noventa. Es conocido por sus planteles jóvenes y por complicar a cualquiera en La Cueva.',
  juventud:
    'Juventud Unida surgió en 1934 de la unión de dos equipos de estudiantes del colegio nacional, de ahí su nombre. Fue el primer club de la zona con iluminación artificial, en 1962.\n\nSus campañas de los años ochenta, con dos títulos seguidos, todavía se recuerdan en las peñas del club. Hoy apuesta a las inferiores y a la gente del barrio.',
  clan:
    'Los del Clan empezó en 1986 como un equipo de amigos que jugaba los torneos nocturnos de verano. En 1991 se afilió a la liga y pasó a disputar Primera.\n\nLas bastones rojos y celestes se volvieron una marca del fútbol de Madariaga. El club se sostiene con rifas, bailes y el trabajo de las familias fundadoras.',
  racing:
    'Racing Club de General Madariaga se fundó en 1927, inspirado por la Academia de Avellaneda, de la que tomó los colores y el apodo. Su primera cancha estuvo frente a la estación del tren.\n\nEs el gran rival de Atlético Cosme: el clásico del pueblo lleva casi un siglo y divide familias enteras. Ganó varios campeonatos en los años noventa y sigue entre los candidatos de cada temporada.',
  'san-vicente':
    'El Club Atlético San Vicente de Pinamar se fundó en 1968, cuando la ciudad todavía era un loteo entre médanos y pinos. Los primeros partidos se jugaban en un claro del bosque.\n\nEl rojo y blanco y el pino del escudo cuentan esa historia. Su clásico es con Deportivo Pinamar, el partido que más gente convoca en la costa.',
  pinamar:
    'Deportivo Pinamar nació en 1959 como club social y deportivo de los primeros vecinos de la ciudad. Las tres estrellas del escudo recuerdan sus primeros títulos regionales.\n\nCon una de las canchas mejor cuidadas de la liga, es una referencia de la costa. Disputa con San Vicente el clásico pinamarense.',
  arena:
    'Arena FC es el club más joven de la liga: se fundó en 2009 en Pinamar, de la mano de exjugadores que querían un proyecto con inferiores y entrenadores recibidos.\n\nCreció rápido, ganó su primer título a pocos años de afiliarse y se ganó el apodo de «los dorados» por el negro y oro de su escudo.',
  'nuevo-amanecer':
    'El Club Social y Deportivo Nuevo Amanecer se fundó en Ostende en 1982, en una reunión de vecinos en la vieja estación de servicio de la avenida Biarritz.\n\nLos colores negro, amarillo y rojo se eligieron en homenaje a las familias belgas que fundaron Ostende. Es un club de barrio con una hinchada fiel que acompaña a todas partes.',
  valeria:
    'Defensores de Valeria del Mar se fundó en 1974 para que los chicos de la localidad no tuvieran que viajar a Pinamar para jugar. La primera cancha se marcó con cal sobre un médano aplanado.\n\nEl escudo, con la ola y la gaviota, resume su identidad costera. Es un equipo que suele pelear la mitad de la tabla y dar algún golpe ante los grandes.',
  'villa-gesell':
    'El Club Atlético Villa Gesell se fundó en 1950, en los primeros años del pueblo creado por Carlos Gesell entre los médanos. Sus colores, azul y amarillo, se tomaron de la bandera de la primera hostería.\n\nEs uno de los clubes históricos de la liga y comparte con San Lorenzo el clásico geselino.',
  'san-lorenzo':
    'San Lorenzo de Villa Gesell nació en 1963, fundado por hinchas del Ciclón que se habían radicado en la costa. Tomó el azul y el rojo y el apodo de «Santo».\n\nEs uno de los clubes más ganadores de la liga y el rival de siempre del Atlético en Gesell. Su cancha, rodeada de pinos, es de las más lindas para jugar.',
  golf:
    'El Deportivo Villa Gesell Golf Club se fundó en 1995 como rama de fútbol de un club social del norte de la ciudad. El zorro del escudo es el animal que se veía en el monte donde se armó la cancha.\n\nSe afilió a la liga a fines de los noventa y se volvió un equipo difícil, de juego ordenado y buena defensa.'
};
