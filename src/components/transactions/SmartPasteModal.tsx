import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { parseIndianFinancialSms, SAMPLE_INDIAN_SMS } from '@/utils/smsParser';
import { formatINR, formatDateIndian } from '@/utils/formatters';
import { PaymentModeBadge } from '@/components/common/PaymentModeBadge';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { ParsedSmsResult } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Smartphone,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface SmartPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartPasteModal: React.FC<SmartPasteModalProps> = ({ isOpen, onClose }) => {
  const { categories, setPrefilledTxData, setIsAddTxOpen, getCategoryByName } = useFinance();
  const [smsText, setSmsText] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedSmsResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [parsingEngine, setParsingEngine] = useState<'regex' | 'gemini'>('regex');

  // Trigger parsing whenever text changes
  useEffect(() => {
    if (!smsText.trim()) {
      setParsedResult(null);
      return;
    }

    // Run client-side regex immediately for 0ms latency
    const regexResult = parseIndianFinancialSms(smsText);
    if (regexResult) {
      // Map suggested category name to ID
      const matchedCat = getCategoryByName(regexResult.suggested_category_name || '');
      if (matchedCat) {
        regexResult.suggested_category_id = matchedCat.id;
      }
      setParsedResult(regexResult);
      setParsingEngine('regex');
    } else {
      setParsedResult(null);
    }
  }, [smsText, categories]);

  if (!isOpen) return null;

  // Optional: Call Supabase Edge Function with Gemini LLM if configured
  const handleAiParse = async () => {
    if (!smsText.trim()) {
      toast.error('Please enter an SMS text first');
      return;
    }

    if (isSupabaseConfigured && supabase) {
      setIsAiLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('parse-sms', {
          body: { text: smsText },
        });

        if (!error && data?.success && data?.data) {
          const llm = data.data;
          const matchedCat = getCategoryByName(llm.suggested_category);
          setParsedResult({
            amount: llm.amount,
            type: llm.type,
            merchant: llm.merchant,
            payment_mode: llm.payment_mode,
            date: llm.date,
            suggested_category_id: matchedCat?.id,
            suggested_category_name: llm.suggested_category,
            confidence: 0.99,
            raw_message: smsText,
          });
          setParsingEngine('gemini');
          toast.success('Parsed with Gemini AI');
          return;
        }
      } catch (e) {
        console.warn('Edge function invoke skipped or failed:', e);
      } finally {
        setIsAiLoading(false);
      }
    }

    // High precision client fallback
    const res = parseIndianFinancialSms(smsText);
    if (res) {
      const matchedCat = getCategoryByName(res.suggested_category_name || '');
      if (matchedCat) res.suggested_category_id = matchedCat.id;
      setParsedResult(res);
      setParsingEngine('regex');
      toast.success('Parsed with Smart Indian Bank Parser');
    } else {
      toast.error('Could not parse transaction details from this text');
    }
  };

  const handleApplyToForm = () => {
    if (!parsedResult) return;

    setPrefilledTxData({
      amount: parsedResult.amount,
      type: parsedResult.type,
      merchant: parsedResult.merchant,
      payment_mode: parsedResult.payment_mode,
      category_id: parsedResult.suggested_category_id || categories[0]?.id,
      date: parsedResult.date,
      note: `SMS Auto-parsed (${parsedResult.account_ref ? 'A/C ' + parsedResult.account_ref : 'Bank alert'})`,
      tags: ['sms-parsed', parsedResult.payment_mode],
      is_shared: false,
    });

    onClose();
    setIsAddTxOpen(true);
    toast.success('SMS pre-filled into transaction review');
  };

  const handleUseSample = (sampleText: string) => {
    setSmsText(sampleText);
  };

  const matchedCategory = parsedResult?.suggested_category_id
    ? categories.find((c) => c.id === parsedResult.suggested_category_id)
    : categories.find((c) => c.name === parsedResult?.suggested_category_name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Smart SMS / UPI Paste
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                  Instant
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste any Indian bank SMS or UPI notification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Quick Demo Samples */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Try with sample bank SMS:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_INDIAN_SMS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUseSample(sample.text)}
                  className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-600 dark:hover:text-teal-300 border border-slate-200/80 dark:border-slate-700 transition font-medium"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Input */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                rows={4}
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="Paste SMS here... e.g. 'Alert: Rs 450.00 debited from HDFC Bank A/c **1234 to SWIGGY on 02-Nov-26 via UPI ref 430718928391.'"
                className="w-full p-4 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono resize-none"
              />
              {smsText && (
                <button
                  onClick={() => setSmsText('')}
                  className="absolute top-3 right-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-teal-500" />
                Regex Parser active (Supports HDFC, SBI, ICICI, Axis, Kotak, UPI)
              </span>
              {isSupabaseConfigured && (
                <button
                  type="button"
                  onClick={handleAiParse}
                  disabled={isAiLoading || !smsText}
                  className="text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin' : ''}`} />
                  Enhance with Gemini Edge
                </button>
              )}
            </div>
          </div>

          {/* Parsed Live Preview Card */}
          {parsedResult ? (
            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                    Recognized Details ({parsingEngine === 'gemini' ? 'Gemini AI' : 'Smart Parser'})
                  </span>
                </div>
                <PaymentModeBadge mode={parsedResult.payment_mode} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                    Amount
                  </span>
                  <p className={`text-2xl font-black rupee-num ${
                    parsedResult.type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {parsedResult.type === 'expense' ? '-' : '+'}{formatINR(parsedResult.amount)}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                    Merchant / Payee
                  </span>
                  <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {parsedResult.merchant}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                    Date
                  </span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {formatDateIndian(parsedResult.date)}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                    Suggested Category
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {matchedCategory && (
                      <CategoryIcon
                        name={matchedCategory.icon}
                        className="w-3.5 h-3.5"
                        color={matchedCategory.color}
                      />
                    )}
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {matchedCategory?.name || parsedResult.suggested_category_name || 'General'}
                    </span>
                  </div>
                </div>
              </div>

              {parsedResult.account_ref && (
                <div className="pt-2 border-t border-teal-200/60 dark:border-teal-900/60 text-[11px] text-slate-500 dark:text-slate-400">
                  Account Reference: <span className="font-semibold text-slate-700 dark:text-slate-300">{parsedResult.account_ref}</span>
                </div>
              )}
            </div>
          ) : smsText.trim() ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold">Unable to recognize format</p>
                <p className="text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                  Try clicking one of the sample bank SMS chips above or paste a message containing an amount (e.g. &quot;Rs 450&quot; or &quot;INR 1200&quot;).
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!parsedResult}
            onClick={handleApplyToForm}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition"
          >
            <span>Review & Save</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
