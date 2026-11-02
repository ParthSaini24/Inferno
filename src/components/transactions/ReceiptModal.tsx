import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface ReceiptModalProps {
  url: string | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ url, onClose }) => {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh] my-auto">
        {/* Top bar */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800 text-white">
          <span className="text-sm font-semibold">Attached Bill / Receipt</span>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Open full image"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image content */}
        <div className="p-4 flex-1 flex items-center justify-center overflow-auto bg-slate-950">
          <img
            src={url}
            alt="Transaction receipt"
            className="max-h-[70vh] object-contain rounded-2xl shadow-lg border border-slate-800"
          />
        </div>
      </div>
    </div>
  );
};
