// Web Audio API Romantic Synthesizer & Audio Manager + YouTube Audio Player

export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const str = urlOrId.trim();
  // Check if it's directly an 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  // Regex to match youtube.com/watch?v=, youtube.com/embed/, youtu.be/, music.youtube.com
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = str.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  return null;
}

class AudioManager {
  private audioCtx: AudioContext | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private synthInterval: number | null = null;
  private rhythmBeatInterval: number | null = null;
  private ytPlayer: unknown = null;
  private isYtApiReady: boolean = false;
  private activeYtId: string | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private activeTrackId: string | null = null;
  private trackTitle: string = 'Sin reproducción';
  private listeners: Set<() => void> = new Set();
  private volume: number = 0.8;
  private frequencyData: Uint8Array = new Uint8Array(0);
  private synthBeatIntensity: number = 0;

  constructor() {
    this.initYouTubeApi();
  }

  private initYouTubeApi() {
    if (typeof window === 'undefined') return;

    // Load YouTube IFrame API script if not present
    if (!document.getElementById('youtube-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Set global ready callback
    const prevOnReady = (window as unknown as Record<string, () => void>).onYouTubeIframeAPIReady;
    (window as unknown as Record<string, () => void>).onYouTubeIframeAPIReady = () => {
      if (prevOnReady) prevOnReady();
      this.isYtApiReady = true;
      if (this.activeYtId) {
        this.createOrPlayYtPlayer(this.activeYtId);
      }
    };

    if ((window as unknown as Record<string, unknown>).YT && (window as unknown as Record<string, Record<string, unknown>>).YT.Player) {
      this.isYtApiReady = true;
    }
  }

  private createOrPlayYtPlayer(ytId: string) {
    if (typeof window === 'undefined') return;

    // Ensure hidden container exists
    let container = document.getElementById('youtube-hidden-player-wrapper');
    if (!container) {
      container = document.createElement('div');
      container.id = 'youtube-hidden-player-wrapper';
      container.style.position = 'fixed';
      container.style.bottom = '-9999px';
      container.style.right = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      container.innerHTML = '<div id="youtube-player-element"></div>';
      document.body.appendChild(container);
    }

    const YT = (window as unknown as Record<string, unknown>).YT as {
      Player: new (
        elementId: string,
        config: Record<string, unknown>
      ) => {
        loadVideoById: (id: string) => void;
        playVideo: () => void;
        pauseVideo: () => void;
        stopVideo: () => void;
        setVolume: (vol: number) => void;
      };
    };

    if (!YT || !YT.Player) {
      this.activeYtId = ytId;
      return;
    }

    if (this.ytPlayer) {
      try {
        const player = this.ytPlayer as {
          loadVideoById: (id: string) => void;
          playVideo: () => void;
          setVolume: (vol: number) => void;
        };
        player.loadVideoById(ytId);
        player.setVolume(this.volume * 100);
        player.playVideo();
      } catch (e) {
        console.warn('Error playing video on existing YT player instance:', e);
      }
    } else {
      try {
        this.ytPlayer = new YT.Player('youtube-player-element', {
          height: '1',
          width: '1',
          videoId: ytId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            loop: 1,
            playlist: ytId,
          },
          events: {
            onReady: (event: { target: { playVideo: () => void; setVolume: (v: number) => void } }) => {
              event.target.setVolume(this.volume * 100);
              event.target.playVideo();
            },
            onStateChange: (event: { data: number }) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                this.isPlaying = true;
                this.notify();
              } else if (event.data === 2 || event.data === 0) {
                this.isPlaying = false;
                this.notify();
              }
            },
          },
        });
      } catch (err) {
        console.warn('Could not instantiate YT.Player:', err);
      }
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.volume;

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);

      this.masterGain.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Returns a real-time normalized audio intensity float [0.0 - 1.0] for music visualization (beats & rhythm)
   */
  public getAudioIntensity(): number {
    if (!this.isPlaying) return 0;

    let realLevel = 0;
    if (this.analyserNode && this.frequencyData.length > 0) {
      this.analyserNode.getByteFrequencyData(this.frequencyData);
      let sum = 0;
      // Focus on low/mid frequencies (bass and beats)
      const sampleBins = Math.min(16, this.frequencyData.length);
      for (let i = 0; i < sampleBins; i++) {
        sum += this.frequencyData[i];
      }
      const avg = sum / sampleBins;
      realLevel = avg / 255;
    }

    if (realLevel < 0.05) {
      realLevel = this.synthBeatIntensity;
      this.synthBeatIntensity *= 0.90; // Smooth decay
    } else {
      realLevel *= 1.8;
    }

    return Math.min(1.0, Math.max(0.0, realLevel));
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = this.volume;
    }
    if (this.ytPlayer) {
      try {
        (this.ytPlayer as { setVolume: (v: number) => void }).setVolume(this.volume * 100);
      } catch (e) {
        // ignore
      }
    }
    this.notify();
  }

  public getVolume() {
    return this.volume;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getActiveTrackId() {
    return this.activeTrackId;
  }

  public getTrackTitle() {
    return this.trackTitle;
  }

  public playTrack(id: string, title: string, file: string) {
    this.stop();
    this.activeTrackId = id;
    this.trackTitle = title;

    const ytId = extractYouTubeId(file);

    if (ytId) {
      this.activeYtId = ytId;
      this.createOrPlayYtPlayer(ytId);
      this.startRhythmBeatGenerator();
      this.isPlaying = true;
    } else if (file.startsWith('synth:')) {
      this.playSynthPreset(file);
      this.isPlaying = true;
    } else {
      this.playFile(file);
      this.isPlaying = true;
    }

    this.notify();
  }

  private startRhythmBeatGenerator() {
    if (this.rhythmBeatInterval !== null) {
      clearInterval(this.rhythmBeatInterval);
    }
    // Rhythmic beat pulse generator so visualizations pulse on YouTube music
    this.rhythmBeatInterval = window.setInterval(() => {
      if (this.isPlaying) {
        this.synthBeatIntensity = 0.8 + Math.random() * 0.2;
      }
    }, 380);
  }

  private playFile(url: string) {
    this.currentAudioElement = new Audio();
    if (/^https?:\/\//i.test(url)) {
      this.currentAudioElement.crossOrigin = 'anonymous';
    }
    this.currentAudioElement.src = url;
    this.currentAudioElement.volume = this.volume;
    this.currentAudioElement.loop = true;

    // Play the element directly through the browser's normal audio pipeline
    // (no Web Audio routing). This keeps the call tied to the user's click
    // (so autoplay policies don't block it) and guarantees it's audible,
    // exactly like opening the mp3 file on its own works. We use the same
    // synthetic "beat pulse" generator as YouTube tracks so the on-screen
    // animations still react rhythmically to the music.
    this.currentAudioElement
      .play()
      .then(() => {
        this.isPlaying = true;
        this.startRhythmBeatGenerator();
        this.notify();
      })
      .catch((err) => {
        console.warn('Playback error or file not found, falling back to romantic piano synth:', err);
        this.playSynthPreset('synth:romantic-piano');
      });

    this.currentAudioElement.onended = () => {
      this.isPlaying = false;
      this.notify();
    };
  }

  private playSynthPreset(preset: string) {
    this.initAudioContext();
    if (!this.audioCtx || !this.masterGain) return;

    let chords: number[][];
    let tempoMs = 380;

    switch (preset) {
      case 'synth:guitar-sunset':
        // Warm Cmaj7 -> Am9 -> Fmaj7 -> G6 arpeggios
        chords = [
          [261.63, 329.63, 392.0, 493.88, 523.25], // Cmaj7
          [220.0, 261.63, 329.63, 392.0, 440.0],  // Am9
          [174.61, 220.0, 261.63, 329.63, 349.23], // Fmaj7
          [196.0, 246.94, 293.66, 392.0, 440.0],  // G6
        ];
        tempoMs = 320;
        break;

      case 'synth:ambient-stars':
        // Cosmic dreamy chords
        chords = [
          [130.81, 196.0, 261.63, 329.63, 392.0],
          [146.83, 220.0, 293.66, 369.99, 440.0],
          [174.61, 261.63, 329.63, 392.0, 523.25],
          [196.0, 293.66, 349.23, 440.0, 587.33],
        ];
        tempoMs = 450;
        break;

      case 'synth:dream-chords':
        chords = [
          [220.0, 277.18, 329.63, 440.0, 554.37],
          [174.61, 220.0, 261.63, 349.23, 440.0],
          [196.0, 246.94, 293.66, 392.0, 493.88],
          [130.81, 164.81, 196.0, 246.94, 329.63],
        ];
        tempoMs = 400;
        break;

      case 'synth:romantic-piano':
      default:
        // Cmaj7 - G - Am - F
        chords = [
          [261.63, 329.63, 392.0, 493.88],
          [196.0, 246.94, 293.66, 392.0],
          [220.0, 261.63, 329.63, 440.0],
          [174.61, 220.0, 261.63, 349.23],
        ];
        tempoMs = 360;
        break;
    }

    let chordIdx = 0;
    let noteIdx = 0;

    const playNote = () => {
      if (!this.audioCtx || !this.masterGain || !this.isPlaying) return;

      this.synthBeatIntensity = 0.95;

      const currentChord = chords[chordIdx];
      const freq = currentChord[noteIdx];

      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      // Soft triangle/sine blend for acoustic warmth
      osc.type = noteIdx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      // Low pass filter to make it gentle and sweet
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.audioCtx.currentTime);

      const now = this.audioCtx.currentTime;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.2, now + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 2.3);

      noteIdx++;
      if (noteIdx >= currentChord.length) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }
    };

    playNote();
    this.synthInterval = window.setInterval(playNote, tempoMs);
  }

  public togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.activeYtId && this.ytPlayer) {
        try {
          (this.ytPlayer as { playVideo: () => void }).playVideo();
          this.isPlaying = true;
          this.startRhythmBeatGenerator();
          this.notify();
          return;
        } catch (e) {
          // ignore
        }
      }
      if (this.activeTrackId) {
        if (this.currentAudioElement) {
          this.currentAudioElement
            .play()
            .then(() => {
              this.isPlaying = true;
              this.startRhythmBeatGenerator();
              this.notify();
            })
            .catch((err) => {
              console.warn('Error resuming playback:', err);
            });
        } else {
          // Resume synth or play current active track
          this.playSynthPreset('synth:romantic-piano');
          this.isPlaying = true;
          this.notify();
        }
      } else {
        // Play default first track
        this.playTrack('song-1', 'Melodía Romántica I', 'synth:romantic-piano');
      }
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
    }
    if (this.ytPlayer) {
      try {
        (this.ytPlayer as { pauseVideo: () => void }).pauseVideo();
      } catch (e) {
        // ignore
      }
    }
    if (this.synthInterval !== null) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.rhythmBeatInterval !== null) {
      clearInterval(this.rhythmBeatInterval);
      this.rhythmBeatInterval = null;
    }
    this.notify();
  }

  public stop() {
    this.pause();
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
    if (this.ytPlayer) {
      try {
        (this.ytPlayer as { stopVideo: () => void }).stopVideo();
      } catch (e) {
        // ignore
      }
    }
    this.activeYtId = null;
    this.activeTrackId = null;
    this.notify();
  }
}

export const audioManager = new AudioManager();