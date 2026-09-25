import { LanguageCode } from '../types';
import { LANGUAGES } from '../i18n/translations';

// Speech Recognition Type declarations for browser compatibility
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

// Keep a local cached list of voices
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  updateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

export const speechService = {
  isRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  },

  isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSynthesisSupported()) return [];
    if (cachedVoices.length === 0) {
      cachedVoices = window.speechSynthesis.getVoices();
    }
    return cachedVoices;
  },

  hasNativeVoice(language: LanguageCode): boolean {
    const voices = this.getVoices();
    const langObj = LANGUAGES.find((l) => l.code === language);
    const targetTag = (langObj?.speechCode || 'en-IN').toLowerCase();
    const prefix = targetTag.split('-')[0];

    return voices.some((v) => {
      const vLang = v.lang.replace('_', '-').toLowerCase();
      return vLang === targetTag || vLang.startsWith(prefix);
    });
  },

  createRecognizer(
    language: LanguageCode,
    onResult: (transcript: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): SpeechRecognitionInstance | null {
    if (!this.isRecognitionSupported()) return null;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition: SpeechRecognitionInstance = new SpeechRecognitionClass();

    const langObj = LANGUAGES.find((l) => l.code === language);
    recognition.lang = langObj?.speechCode || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      onError(event);
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  },

  /**
   * Speaks text fluently across all 11 Indian languages.
   * If the browser has a native Indic voice installed (e.g. Tamil, Hindi, Telugu), it speaks the native script.
   * If the user's OS only provides English TTS voices, it seamlessly speaks the phonetic/transliterated Indian text
   * using an Indian-accented English voice for smooth, 100% natural pronunciation without stumbling or silent failures.
   */
  speakText(
    text: string,
    language: LanguageCode,
    onEnd?: () => void,
    phoneticText?: string
  ) {
    if (!this.isSynthesisSupported()) return;

    window.speechSynthesis.cancel(); // Stop any active speech

    const voices = this.getVoices();
    const langObj = LANGUAGES.find((l) => l.code === language);
    const targetCode = (langObj?.speechCode || 'en-IN').toLowerCase();
    const langPrefix = targetCode.split('-')[0];

    // 1. Look for exact dialect match (e.g., "ta-IN", "hi-IN", "te-IN")
    let chosenVoice = voices.find((v) => {
      const vl = v.lang.replace('_', '-').toLowerCase();
      return vl === targetCode;
    });

    // 2. Look for language prefix match (e.g. "ta", "hi", "mr", "gu", "bn")
    if (!chosenVoice) {
      chosenVoice = voices.find((v) => {
        const vl = v.lang.replace('_', '-').toLowerCase();
        return vl.startsWith(langPrefix);
      });
    }

    // 3. If no native voice exists on the client system for this Indian language,
    // fallback gracefully to an Indian English or natural voice using phonetic Indian text.
    let textToSpeak = text;
    let voiceLangToSet = langObj?.speechCode || 'en-IN';

    if (!chosenVoice && language !== 'en') {
      // Find an Indian English voice if available (e.g. en-IN or name containing India)
      const indianEnglishVoice = voices.find(
        (v) =>
          v.lang.replace('_', '-').toLowerCase() === 'en-in' ||
          v.name.toLowerCase().includes('india') ||
          v.name.toLowerCase().includes('hindi')
      );

      if (indianEnglishVoice) {
        chosenVoice = indianEnglishVoice;
        voiceLangToSet = 'en-IN';
      }

      // Use the phonetic romanized Indian text if available for fluent pronunciation
      if (phoneticText) {
        textToSpeak = phoneticText;
      }
    }

    // If still no voice, pick whatever default voice the browser provides
    if (!chosenVoice && voices.length > 0) {
      chosenVoice = voices.find((v) => v.default) || voices[0];
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = chosenVoice ? chosenVoice.lang : voiceLangToSet;
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    // Rate: 0.92 gives natural, fluent conversational tempo for price numbers and market names
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking() {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }
};
