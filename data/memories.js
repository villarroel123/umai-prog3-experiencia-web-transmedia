import { chapters } from "./chapters";

const filmDetails = {
  chihiro: {
    opening: "Entre pasillos de vapor y puertas que cambian de lugar, tres señales esperan volver a la memoria.",
    note: "Un viaje puede recuperar su nombre cuando reconocemos lo que nos acompañó.",
    scene: "bathhouse",
    sceneImage: "/images/scenes/chihiro-bathhouse.png",
    sceneAlt: "Casa de baños japonesa entre cerezos y un puente rojo",
    emblem: "門",
  },
  howl: {
    opening: "En una casa que camina, el fuego, los caminos y una pequeña joya guardan lo que falta.",
    note: "Cada chispa conserva una promesa, incluso cuando el castillo cambia de rumbo.",
    scene: "hearth",
    sceneImage: "/images/scenes/howl-castle.png",
    sceneAlt: "Castillo ambulante sobre colinas y un cielo azul",
    emblem: "✧",
  },
  totoro: {
    opening: "Bajo los árboles, los gestos más pequeños vuelven a llenar de vida las páginas perdidas.",
    note: "El bosque responde a quien observa, espera y cuida.",
    scene: "forest",
    sceneImage: "/images/scenes/totoro-forest.png",
    sceneAlt: "Camino de un bosque japonés iluminado entre árboles",
    coverCharacterImage: "/images/scenes/totoro-character.png",
    emblem: "✿",
  },
};

export const movies = chapters.map((chapter) => ({
  id: chapter.id,
  filmId: chapter.filmId,
  title: chapter.label,
  number: chapter.number,
  color: chapter.color,
  ...filmDetails[chapter.id],
}));

export const memories = [
  {
    id: "mascara-sin-cara", movieId: "chihiro", title: "Máscara de Sin Cara",
    description: "Una figura espera detrás de los paneles de papel.",
    interactionType: "identificar-silueta", instruction: "Encontrá la sombra de Sin Cara.",
    narrative: "A veces, reconocer a alguien es el primer paso para encontrar el camino.",
    symbol: "◕", initialStatus: "pending",
    image: "/images/memories/chihiro/mascara-sin-cara.png",
    imageAlt: "Máscara blanca de Sin Cara con marcas violetas",
    imageShape: "portrait",
  },
  {
    id: "cinta-zeniba", movieId: "chihiro", title: "Cinta de Zeniba",
    description: "Un pequeño regalo recuerda el orden del viaje.",
    interactionType: "ordenar-secuencia", instruction: "Ordená los recuerdos del viaje.",
    narrative: "Los lazos que elegimos llevar nos acompañan de regreso.",
    symbol: "⌁", initialStatus: "pending",
    image: "/images/memories/chihiro/cinta-zeniba.png",
    imageAlt: "Cinta violeta de Zeniba con flores bordadas",
    imageShape: "wide",
  },
  {
    id: "haku", movieId: "chihiro", title: "Haku",
    description: "El río conserva un nombre que casi se había perdido.",
    interactionType: "reconstruir-imagen", instruction: "Reconstruí la imagen del río.",
    narrative: "Recordar un nombre puede devolverle su libertad a una historia.",
    symbol: "〰", initialStatus: "pending",
    image: "/images/memories/chihiro/haku.png",
    imageAlt: "Haku como dragón blanco de melena verde",
    imageShape: "wide",
  },
  {
    id: "calcifer", movieId: "howl", title: "Calcifer",
    description: "Una brasa espera que alguien encienda otra vez la chimenea.",
    interactionType: "encender-chimenea", instruction: "Ayudá a Calcifer a despertar.",
    narrative: "Una chispa pequeña puede sostener un hogar entero.",
    symbol: "✺", initialStatus: "pending",
    image: "/images/memories/howl/calcifer.png",
    imageAlt: "Calcifer, pequeño espíritu de fuego anaranjado",
    imageShape: "square",
  },
  {
    id: "perilla-magica", movieId: "howl", title: "Perilla mágica",
    description: "Cuatro colores señalan puertas hacia lugares distintos.",
    interactionType: "descubrir-combinacion", instruction: "Descubrí el destino correcto.",
    narrative: "Cada puerta cambia el paisaje, pero las decisiones hacen el camino.",
    symbol: "◉", initialStatus: "pending",
    image: "/images/memories/howl/perilla-magica.png",
    imageAlt: "Perilla mágica circular con cuatro colores",
    imageShape: "square",
  },
  {
    id: "pendiente-howl", movieId: "howl", title: "Pendiente de Howl",
    description: "Un brillo aparece entre recuerdos que parecen iguales.",
    interactionType: "memoria-parejas", instruction: "Encontrá las parejas.",
    narrative: "Hay señales que brillan más cuando encontramos su par.",
    symbol: "◇", initialStatus: "pending",
    image: "/images/memories/howl/pendiente-howl.png",
    imageAlt: "Pendiente dorado de Howl con gema verde",
    imageShape: "portrait",
  },
  {
    id: "bellotas", movieId: "totoro", title: "Bellotas",
    description: "Una semilla guarda la promesa de un árbol.",
    interactionType: "hacer-crecer-arbol", instruction: "Hacé crecer el árbol.",
    narrative: "Lo que cuidamos hoy puede crecer más allá de nuestra mirada.",
    symbol: "●", initialStatus: "pending",
    image: "/images/memories/totoro/bellotas.png",
    imageAlt: "Tres bellotas con hojas de roble",
    imageShape: "square",
  },
  {
    id: "paraguas", movieId: "totoro", title: "Paraguas",
    description: "La lluvia convierte un gesto sencillo en un recuerdo.",
    interactionType: "completar-escena", instruction: "Entregale el paraguas a Totoro.",
    narrative: "Compartir refugio también puede abrir una puerta a la magia.",
    symbol: "☂", initialStatus: "pending",
    image: "/images/memories/totoro/paraguas.png",
    imageAlt: "Paraguas rojo antiguo con gotas de lluvia",
    imageShape: "wide",
  },
  {
    id: "totoro-pequeno", movieId: "totoro", title: "Totoro pequeño",
    description: "Algo diminuto se esconde entre las hojas del bosque.",
    interactionType: "seguir-personaje", instruction: "Encontrá al pequeño Totoro.",
    narrative: "Los encuentros más breves pueden quedarse para siempre.",
    symbol: "✦", initialStatus: "pending",
    image: "/images/memories/totoro/totoro-pequeno.png",
    imageAlt: "Pequeño espíritu blanco del bosque",
    imageShape: "portrait",
  },
];

export function getMovie(movieId) {
  return movies.find((movie) => movie.id === movieId);
}

export function getMemory(movieId, memoryId) {
  return memories.find((memory) => memory.movieId === movieId && memory.id === memoryId);
}

export function getMovieMemories(movieId) {
  return memories.filter((memory) => memory.movieId === movieId);
}
