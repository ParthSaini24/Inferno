import React, { useState, useEffect, useMemo } from 'react';
import { formatINR } from '@/utils/formatters';
import { buildUpiUri, generateUpiQrDataUrl, getAppIntentUrl } from '@/utils/upi';
import {
  X,
  Copy,
  Check,
  Download,
  Share2,
  CheckCircle2,
  Smartphone,
  ExternalLink,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  payeeName: string;
  payeeVpa: string;
  amount: number;
  note?: string;
  fromName?: string;
  onMarkAsSettled?: () => void;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  isOpen,
  onClose,
  payeeName,
  payeeVpa,
  amount,
  note = 'PaisaPilot Household Settlement',
  fromName,
  onMarkAsSettled,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Deterministic, memoized UPI URI
  const upiUri = useMemo(() => {
    return buildUpiUri({
      vpa: payeeVpa || 'parth@okaxis',
      payeeName: payeeName || 'PaisaPilot User',
      amount: amount > 0 ? amount : 100,
      note,
    });
  }, [payeeVpa, payeeName, amount, note]);

  useEffect(() => {
    if (!isOpen || !upiUri) return;

    let isMounted = true;
    setIsGenerating(true);

    generateUpiQrDataUrl(upiUri, 360)
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate UPI QR:', err);
        if (isMounted) {
          setIsGenerating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, upiUri]);

  if (!isOpen) return null;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(payeeVpa || 'parth@okaxis');
    setCopiedVpa(true);
    toast.success('UPI ID copied to clipboard');
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiUri);
    setCopiedLink(true);
    toast.success('UPI Payment Link copied');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `UPI_QR_${payeeName.replace(/\s+/g, '_')}_${amount}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code image downloaded');
  };

  const handleShareWhatsApp = () => {
    const text = `Hi ${fromName || 'there'}! Please settle your household share of ${formatINR(
      amount
    )} to ${payeeName} (${payeeVpa}).\n\nDirect UPI Pay link: ${upiUri}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleConfirmSettlement = () => {
    if (onMarkAsSettled) {
      onMarkAsSettled();
    }
    toast.success(`Settlement of ${formatINR(amount)} marked as complete!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-md max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto">
        {/* Header - Fixed */}
        <div className="shrink-0 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Instant UPI QR</h2>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                NPCI Standard Payment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col items-center space-y-3.5 overscroll-contain">
          {/* Amount & Payee Badge */}
          <div className="w-full p-3.5 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Amount to Pay
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white rupee-num">
              {formatINR(amount)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paying to <span className="font-bold text-slate-800 dark:text-slate-200">{payeeName}</span>
            </p>
          </div>

          {/* QR Code Container */}
          <div className="relative p-3 bg-white rounded-2xl shadow-md border-2 border-slate-100 dark:border-slate-700">
            {isGenerating ? (
              <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`UPI QR for ${payeeName}`}
                className="w-48 h-48 sm:w-52 sm:h-52 rounded-xl object-contain"
              />
            ) : (
              <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-slate-400 text-xs">
                QR Unavailable
              </div>
            )}

            {/* Small Center UPI Pill */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black shadow-md border border-white">
                UPI
              </span>
            </div>
          </div>

          {/* VPA Copy Bar */}
          <div className="w-full max-w-xs flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono border border-slate-200/80 dark:border-slate-700">
            <span className="truncate text-slate-700 dark:text-slate-300 font-bold select-all">
              {payeeVpa || 'parth@okaxis'}
            </span>
            <button
              onClick={handleCopyVpa}
              className="ml-2 p-1 text-teal-600 dark:text-teal-400 hover:text-teal-700 font-sans font-bold flex items-center gap-1 transition"
              title="Copy UPI ID"
            >
              {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{copiedVpa ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Mobile Direct 1-Tap App Intent Launchers */}
          <div className="w-full space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Tap to open Indian Payment App
            </span>
            <div className="grid grid-cols-4 gap-2">
              <a
                href={getAppIntentUrl('gpay', upiUri)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center hover:border-teal-500 transition active:scale-95 text-center group"
              >
                <div className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center text-[10px] font-black text-blue-600">
                  GPay
                </div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  GPay
                </span>
              </a>

              <a
                href={getAppIntentUrl('phonepe', upiUri)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center hover:border-purple-500 transition active:scale-95 text-center group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white shadow-2xs flex items-center justify-center text-[10px] font-black">
                  Pe
                </div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  PhonePe
                </span>
              </a>

              <a
                href={getAppIntentUrl('paytm', upiUri)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center hover:border-sky-500 transition active:scale-95 text-center group"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500 text-white shadow-2xs flex items-center justify-center text-[10px] font-black">
                  Paytm
                </div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  Paytm
                </span>
              </a>

              <a
                href={getAppIntentUrl('bhim', upiUri)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center hover:border-emerald-500 transition active:scale-95 text-center group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white shadow-2xs flex items-center justify-center text-[10px] font-black">
                  BHIM
                </div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 mt-1">
                  BHIM
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions - Fixed */}
        <div className="shrink-0 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            onClick={handleConfirmSettlement}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Have Paid • Mark as Settled</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleCopyLink}
              className="py-2 px-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1 transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleDownloadQr}
              className="py-2 px-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save QR</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="py-2 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 flex items-center justify-center gap-1 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
