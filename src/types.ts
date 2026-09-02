export interface CandleOption {
  id: string;
  label: string;
  correct: boolean;
  response: string;
}

export interface CandleConfig {
  id: number;
  question: string;
  answer?: string;
  response?: string; // Mensaje especial personalizado al acertar
  type: 'text' | 'choice';
  options?: CandleOption[];
  color: string;
  colorName?: string;
  fogMessage?: string;
}

export interface SongConfig {
  id: string;
  title: string;
  file: string; // URL, mp3 path, or "synth:preset-name"
  artist?: string;
  isSecret?: boolean;
}

export interface StarMessage {
  id: string;
  text: string;
  top: string;
  left: string;
  color?: string;
  isSpecial?: boolean;
}

export interface AppConfig {
  herName: string;
  hiddenMessage: string;
  fogMessages?: string[];
  candles: CandleConfig[];
  screen2Message: string;
  songs: SongConfig[];
  screen3Messages: string[];
  screen4Messages: string[];
  sandMessage: string;
  starMessages: StarMessage[];
  finalMessage: string;
  friendLetterPrompt?: string;
  friendLetterText?: string;
  friendLetterSongTitle?: string;
  friendLetterSongUrl?: string;
}

export type ScreenId =
  | 'screen1'
  | 'screen2'
  | 'screen3'
  | 'screen4'
  | 'screen5'
  | 'screenChaos'
  | 'screen6'
  | 'screenFriendLetter'
  | 'screen7';
