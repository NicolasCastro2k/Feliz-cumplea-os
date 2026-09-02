import { AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  herName: 'Mi Amor',
  hiddenMessage: 'Te amo mi niña bonita',
  fogMessages: [
    'Te amo en cada segundo, cada aliento y momento...',
    'Te volviste esa lucecita que guia mi camino...',
    'Me haces sentir vivo, fuerte y feliz...',
    'Gracias por estar en mi vida...Te amo.'
  ],
  candles: [
    {
      id: 0,
      question: '¿Cual tu apodo que más me gusta ?',
      type: 'text',
      answer: 'Mi plantita',
      response: '¡Exacto mi plantita hermosa! ♥',
      color: '#a81c38',
      colorName: 'Granate',
      fogMessage: '♥ Te amo en cada segundo, cada aliento y momento...♥',
    },
    {
      id: 1,
      question: '¿Cuál es nuestra canción especial?',
      type: 'text',
      answer: 'If the world was ending',
      response: 'Que chica tan lista~',
      color: '#b57edc',
      colorName: 'Lila',
      fogMessage: '♥Si el mundo se acabara...Seria porque ya no estoy contigo♥',
    },
    {
      id: 2,
      question: '¿Que es lo que más me gusta de ti?',
      type: 'text',
      answer: 'Ojos',
      response: '¡Me encantaria perderme en ellos cada dia de mi vida',
      color: '#e2725b',
      colorName: 'Terracota',
      fogMessage: '♥ Si, tambien tus caderas, tus muslos y margaritas, simplemente todo~',
    },
    {
      id: 3,
      question: '¿Estas sonriendo?',
      type: 'choice',
      response: 'Amo esa sonrisa y esas margaritas',
      color: '#3b82f6',
      colorName: 'Azul',
      fogMessage: '♥ Me enamore de cada centimetro de ti, de tu alma y cuerpo',
      options: [
        { id: '1', label: 'Quizas', correct: false, response: 'Anda, se sincera mi amor!' },
        { id: '2', label: 'Si', correct: true, response: 'Bien, Buena chica. ♥' },
        { id: '3', label: 'No', correct: false, response: '¿Me mientes? Sabes que tienes una linda sonrisa.' },
        { id: '4', label: 'Puede ser', correct: false, response: '¿Seguuuura~?' },
      ],
    },
  ],

  screen2Message:
    'Tenemos una playlist que se volvio mi playlist oficial, aqui algunas de las canciones que amo gracias a ti...',
  songs: [
    {
      id: 'song-1',
      title: 'Honeybee',
      artist: 'Olivia Rodrigo',
      file: 'https://www.youtube.com/watch?v=nes27IqHVEM',
    },
    {
      id: 'song-2',
      title: 'Call It What You Want',
      artist: 'Taylor Swift',
      file: 'https://www.youtube.com/watch?v=J1oCCGSt6XA',
    },
    {
      id: 'song-3',
      title: 'Accidentally In Love',
      artist: 'Counting Crows',
      file: 'https://www.youtube.com/watch?v=vnBec1gpXSM',
    },
    {
      id: 'song-4',
      title: 'Secrets',
      artist: 'OneRepublic',
      file: '/secrets-onerepublic.mp3',
      isSecret: true,
    },
    {
      id: 'song-5',
      title: 'Stupid Song',
      artist: 'Olivia Rodrigo',
      file: 'https://www.youtube.com/watch?v=vTzU2jIKnvM',
    },
    {
      id: 'song-6',
      title: 'Fate of Ophelia',
      artist: 'Taylor Swift',
      file: 'https://www.youtube.com/watch?v=rbmdfEQODOw',
    },
    {
      id: 'song-7',
      title: 'Love Song',
      artist: 'Lana Del Rey',
      file: 'https://www.youtube.com/watch?v=GgqAVgW4jqg',
    },
    {
      id: 'song-8',
      title: 'Cinnamon Girl',
      artist: 'Lana Del Rey',
      file: 'https://www.youtube.com/watch?v=F_MJhtjxLss',
    },
    {
      id: 'song-9',
      title: 'If The World Was Ending',
      artist: 'JP Saxe ft. Julia Michaels',
      file: 'https://www.youtube.com/watch?v=39wgpzDuUL0',
    },
  ],

  screen3Messages: [
    'Mi amor por ti es tan profundo',
    'Que ya no te amo solo desde el corazon',
    'Te amo desde mi alma, desde mi ser.',
    'Porque ya no hay algo que quiera más que a ti...',
    'Te amo,  Lisbeth.',
  ],

  screen4Messages: [
    'Aprendi a amar las flores, aprendi a amar el cielo y los colores.',
    'Porque tu nombre esta en cada uno de ellos...',
  ],

  sandMessage: 'He buscado el rayo verde toda mi vida...Pero te encontre y para mi eso vale más que cualquier tesoro.',

  starMessages: [
    {
      id: 'star-1',
      text: 'El cielo esta lleno de estrellas y galaxias, pero mis favoritas siempre seran tus pecas.',
      top: '20%',
      left: '18%',
      color: '#fbbf24',
    },
    {
      id: 'star-2',
      text: 'Quisiera llenarte de s- Mierda, ese es mi deseo...Pasa al siguiente.',
      top: '32%',
      left: '80%',
      color: '#f43f5e',
    },
    {
      id: 'star-3',
      text: 'Entre tu sonrisa, tus ojitos y margaritas...Me he vuelto un adicto a ti mi niña.',
      top: '62%',
      left: '15%',
      color: '#22d3ee',
    },
    {
      id: 'star-4',
      text: 'Dicen que el cielo es a donde vamos todos, pero dulzura...Eres todo el cielo que necesito.',
      top: '68%',
      left: '78%',
      color: '#c084fc',
    },
    {
      id: 'star-5',
      text: 'Mi vida a la tuya, mi aliento es tuyo...Lo es hoy, lo sera siempre mi plantita.',
      top: '26%',
      left: '52%',
      color: '#34d399',
    },
    {
      id: 'star-6',
      text: 'Eres mi delirio, eres mi martirio, eres mi soda pop.',
      top: '48%',
      left: '12%',
      color: '#AB0C57',
    },

    {
      id: 'star-special',
      text: '♥ ¡FELIZ CUMPLEAÑOS MI AMOR! ♥ Espero, esto te haya gustado. Lo hice con mucho amor y cariño, Realmente te amo mi niña...No sabes cuanto deseo un beso... Estoy completamente enamorado de ti...De una manera tan unica que quema...que arde con fuerza y no quiero que deje de hacerlo. ♥',
      top: '46%',
      left: '48%',
      color: '#f59e0b',
      isSpecial: true,
    },
  ],

  finalMessage: 'Feliz Cumpleaños, Mi dulce niña ',

  friendLetterPrompt:
    'tienes una carta de tu amiga, a la que le falta una ferreteria entera de tornillos',

  friendLetterText: `Mirar atrás y ver el camino que hemos recorrido juntas es, sin duda, una de las cosas que más valora mi corazón. Parece que fue ayer cuando éramos unas niñas corriendo sin preocupaciones, compartiendo risas por cosas tontas y empezando a construir un mundo propio dentro de nuestra amistad.

Amo profundamente crecer a tu lado. Ver cómo hemos cambiado, cómo hemos madurado, cómo nos hemos apoyado en los momentos difíciles y cómo hemos celebrado cada pequeño triunfo como si fuera propio. No hay un solo recuerdo importante de mi vida en el que tú no estés presente.

Gracias por ser ese refugio seguro al que siempre puedo volver, por conocerme con solo una mirada y por sostener mi mano en cada etapa. La vida es mucho más bonita, luminosa y divertida contigo en ella.

Que sigamos sumando años, arrugas de tanto reír, viajes, locuras y charlas. Te quiero hoy, mañana y siempre. Qué fortuna tan grande es la nuestra de haber coincidido en esta vida.`,

  friendLetterSongTitle: 'Cancion Especial',
  friendLetterSongUrl: '/michel.mp3',
};

const STORAGE_KEY = 'regalo_novia_config_v3';

export function loadConfig(): AppConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      // Merge saved config on top of DEFAULT_CONFIG so any field the user
      // customized from the "Personalizar Regalo" modal is preserved across
      // reloads, while any new fields added later in code (via app updates)
      // still fall back to their default values.
      const merged: AppConfig = {
        ...DEFAULT_CONFIG,
        ...parsed,
      };

      return merged;
    }
  } catch (e) {
    console.error('Error loading config from localStorage:', e);
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: AppConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config to localStorage:', e);
  }
}

export function resetConfig(): AppConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error resetting config:', e);
  }
  return DEFAULT_CONFIG;
}
