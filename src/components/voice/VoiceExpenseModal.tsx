import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { parseVoiceExpense, ParsedVoiceResult } from '@/utils/voiceParser';
import { formatINR } from '@/utils/formatters';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { PaymentModeBadge } from '@/components/common/PaymentModeBadge';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  Volume2,
  VolumeX,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { toast } from 'sonner';

interface VoiceExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_VOICE_PROMPTS = [
  'Swiggy pe 450 diye',
  'Auto wale ko 60 rupaye cash',
  'D-Mart se 3200 ki grocery li card se',
  'Petrol pump par 2000 ka tel bharwaya',
  'Bijli ka bill 2150 netbanking se bhara',
  'Chai sutta 40 cash',
];

export const VoiceExpenseModal: React.FC<VoiceExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, getCategoryById } = useFinance();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceResult | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN'; // Default to Indian Hindi / Hinglish

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          const parsed = parseVoiceExpense(text);
          setParsedResult(parsed);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. You can still test with sample chips below.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      toast.info('Speech recognition not supported in this browser. Use sample prompts below.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setParsedResult(null);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  const handleSelectSample = (sample: string) => {
    setTranscript(sample);
    const parsed = parseVoiceExpense(sample);
    setParsedResult(parsed);
  };

  const handleSaveTransaction = async () => {
    if (!parsedResult) return;

    await addTransaction({
      amount: parsedResult.amount,
      type: 'expense',
      category_id: parsedResult.category_id,
      payment_mode: parsedResult.payment_mode,
      merchant: parsedResult.merchant,
      note: parsedResult.notes,
      date: new Date().toISOString().split('T')[0],
      is_shared: false,
    });

    toast.success(`Voice logged: ${parsedResult.merchant} for ${formatINR(parsedResult.amount)}`);
    onClose();
  };

  if (!isOpen) return null;

  const category = parsedResult ? getCategoryById(parsedResult.category_id) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Voice Expense Logger</h2>
              <p className="text-[11px] text-teal-100">Speak naturally in Hindi, Hinglish or English</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Listening Sphere & Soundwave */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4 text-center">
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative ${
              isListening
                ? 'bg-rose-500 text-white scale-110 shadow-xl shadow-rose-500/40 ring-8 ring-rose-500/20 animate-pulse'
                : 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-2 border-teal-500/40 hover:bg-teal-100 hover:scale-105 shadow-md'
            }`}
          >
            {isListening ? (
              <Mic className="w-10 h-10 animate-bounce" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>

          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {isListening ? 'Listening... Speak now!' : 'Tap mic and speak your expense'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              e.g. &ldquo;Swiggy pe 450 diye&rdquo; or &ldquo;Auto 60 cash&rdquo;
            </p>
          </div>

          {/* Live Transcript Bubble */}
          <div className="w-full min-h-[56px] p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-xs">
            {transcript ? (
              <p className="text-slate-800 dark:text-slate-200 font-semibold italic">
                &ldquo;{transcript}&rdquo;
              </p>
            ) : (
              <span className="text-slate-400">Your spoken words will appear here...</span>
            )}
          </div>

          {/* Quick Indian Hinglish Test Prompts */}
          <div className="w-full space-y-1.5 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Try 1-Click Indian Voice Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_VOICE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSelectSample(prompt)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/40 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 transition"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Parsed Output Card */}
          {parsedResult && (
            <div className="w-full p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-left space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Recognized Expense
                </span>
                <span className="text-lg font-black text-slate-900 dark:text-white rupee-num">
                  {formatINR(parsedResult.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Merchant</span>
                  <strong className="text-slate-800 dark:text-slate-200 truncate block">
                    {parsedResult.merchant}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">Payment Mode</span>
                  <PaymentModeBadge mode={parsedResult.payment_mode} size="sm" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
                <CategoryIcon
                  name={category?.icon || 'HelpCircle'}
                  backgroundColor={category?.color || '#0d9488'}
                  color={category?.color || '#0d9488'}
                  size={14}
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {category?.name || 'Other Expense'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!parsedResult}
            onClick={handleSaveTransaction}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 disabled:opacity-50 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>Confirm & Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
