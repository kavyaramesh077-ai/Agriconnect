import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Volume2, ArrowRight } from 'lucide-react';
import { LanguageCode, MandiRecord } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { speechService } from '../services/speech';
import { api } from '../services/api';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultRecord, setResultRecord] = useState<MandiRecord | null>(null);
  const [spokenReply, setSpokenReply] = useState('');
  const [phoneticReply, setPhoneticReply] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    if (!isOpen) {
      handleStopListening();
      speechService.stopSpeaking();
      setTranscript('');
      setResultRecord(null);
      setSpokenReply('');
      setPhoneticReply('');
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleStartListening = () => {
    setErrorMsg('');
    if (!speechService.isRecognitionSupported()) {
      setErrorMsg(t.voiceNotSupported);
      return;
    }

    try {
      const recognition = speechService.createRecognizer(
        language,
        (detectedText) => {
          setTranscript(detectedText);
          setIsListening(false);
          handleProcessQuery(detectedText);
        },
        (err) => {
          console.warn('Speech error:', err);
          setIsListening(false);
          if (err.error !== 'no-speech') {
            setErrorMsg('Microphone error: Please check browser permissions or use text input below.');
          }
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognition) {
        setIsListening(true);
        recognition.start();
      }
    } catch (err: any) {
      console.error(err);
      setIsListening(false);
      setErrorMsg(t.voiceNotSupported);
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const response = await api.sendVoiceQuery(queryText, language);
      if (response.success && response.record) {
        setResultRecord(response.record);
        setSpokenReply(response.spokenReply);
        setPhoneticReply(response.phoneticReply || '');
        // Automatically speak the response fluently
        speechService.speakText(
          response.spokenReply,
          language,
          () => setIsSpeaking(false),
          response.phoneticReply
        );
        setIsSpeaking(true);
      } else {
        setErrorMsg('Could not find market price for this query. Please check crop name.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process voice query.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayAudio = () => {
    if (!spokenReply) return;
    setIsSpeaking(true);
    speechService.speakText(
      spokenReply,
      language,
      () => setIsSpeaking(false),
      phoneticReply
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Mic className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">{t.voiceModalTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Mic Action */}
        <div className="py-6 flex flex-col items-center text-center">
          <button
            onClick={isListening ? handleStopListening : handleStartListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
              isListening
                ? 'bg-rose-600 text-white ring-8 ring-rose-100 animate-pulse'
                : 'bg-emerald-700 text-white hover:bg-emerald-800 ring-8 ring-emerald-50'
            }`}
          >
            {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>

          <p className="mt-4 text-sm font-semibold text-stone-800">
            {isListening ? t.voiceListening : t.voiceTapToSpeak}
          </p>

          {transcript && (
            <div className="mt-3 px-4 py-2 bg-stone-50 rounded-xl text-stone-700 text-sm italic max-w-sm">
              "{transcript}"
            </div>
          )}

          {errorMsg && (
            <p className="mt-2 text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Sample Voice Prompts */}
        {!resultRecord && !isListening && (
          <div className="mb-6 bg-stone-50 rounded-2xl p-4 text-left border border-stone-100">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
              {t.voiceExampleTitle}
            </span>
            <div className="space-y-1.5">
              {[t.voiceExample1, t.voiceExample2, t.voiceExample3].map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTextInput(ex);
                    handleProcessQuery(ex);
                  }}
                  className="w-full text-left text-xs text-emerald-800 hover:text-emerald-950 font-medium py-1 px-2 rounded-lg hover:bg-emerald-50/60 transition-colors flex items-center justify-between"
                >
                  <span>"{ex}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Real Answer Card */}
        {resultRecord && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-left">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-emerald-800">{resultRecord.commodity}</span>
                <h4 className="text-base font-bold text-stone-900">{resultRecord.market}</h4>
              </div>
              <button
                onClick={handlePlayAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-sm hover:bg-emerald-50"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-emerald-600' : ''}`} />
                <span>{t.voiceSpeakAnswer}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-200/60 text-center">
              <div>
                <span className="text-[11px] text-stone-500 block">Rate in kg</span>
                <span className="text-xl font-black text-emerald-800 tabular-nums">
                  ₹{(resultRecord.modalPrice / 100).toFixed(2)}
                </span>
                <span className="text-[10px] text-stone-500">/ kg</span>
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block">Quintal Rate</span>
                <span className="text-base font-bold text-stone-800 tabular-nums">
                  ₹{resultRecord.modalPrice}
                </span>
                <span className="text-[10px] text-stone-400">/ 100 kg</span>
              </div>
              <div>
                <span className="text-[11px] text-stone-500 block">kg Range</span>
                <span className="text-xs font-semibold text-stone-700 tabular-nums">
                  ₹{(resultRecord.minPrice / 100).toFixed(1)} - ₹{(resultRecord.maxPrice / 100).toFixed(1)}
                </span>
                <span className="text-[10px] text-stone-400">Min - Max</span>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-stone-500 flex flex-wrap items-center justify-between gap-1">
              <span>{resultRecord.source}</span>
              <span>{resultRecord.status}</span>
            </div>
          </div>
        )}

        {/* Text Alternative Input (Zero Mandatory Voice) */}
        <div className="border-t border-stone-100 pt-4">
          <label className="text-xs font-medium text-stone-500 block mb-1.5">
            {t.voiceOrType}
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessQuery(textInput);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. Tomato price in Krishnagiri / தக்காளி விலை"
              className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <button
              type="submit"
              disabled={isProcessing || !textInput.trim()}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isProcessing ? '...' : t.voiceAskBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
