import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { PaymentMode } from '@/types';
import { X, ArrowRight, Smartphone, Banknote, Landmark, CheckCircle2, QrCode } from 'lucide-react';
import { UpiQrModal } from '@/components/upi/UpiQrModal';
import { toast } from 'sonner';

interface RecordSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
  fromName?: string;
  toName?: string;
}

export const RecordSettlementModal: React.FC<RecordSettlementModalProps> = ({
  isOpen,
  onClose,
  defaultAmount = 0,
  fromName = 'Rohan Verma',
  toName = 'Parth Saini',
}) => {
  const { addSettlement, householdMembers } = useFinance();
  const { user } = useAuth();

  const [fromUser, setFromUser] = useState(fromName);
  const [toUser, setToUser] = useState(toName);
  const [amountStr, setAmountStr] = useState(defaultAmount > 0 ? String(defaultAmount) : '4200');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [note, setNote] = useState('Household expense settlement via UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid settlement amount');
      return;
    }

    await addSettlement({
      from_user: 'usr-member',
      to_user: user?.id || 'usr-pilot-01',
      from_name: fromUser,
      to_name: toUser,
      amount,
      date,
      note,
      payment_mode: paymentMode,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Record Settlement
              </h2>
              <p className="text-xs text-slate-400">Settle up shared household money</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Who paid whom */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payer (From)
              </label>
              <select
                value={fromUser}
                onChange={(e) => setFromUser(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {householdMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Receiver (To)
              </label>
              <select
                value={toUser}
                onChange={(e) => setToUser(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {householdMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Settlement Amount (₹)
            </label>
            <div className="flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-2xl font-black text-slate-400 mr-2">₹</span>
              <input
                type="number"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full text-2xl font-black bg-transparent text-slate-900 dark:text-white focus:outline-none rupee-num"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Settled Via
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'upi', label: 'UPI / GPay', icon: Smartphone },
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'netbanking', label: 'Bank Transfer', icon: Landmark },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMode(m.id as PaymentMode)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMode === 'upi' && (
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-2xs"
              >
                <QrCode className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Show Dynamic UPI QR & Intent Buttons</span>
              </button>
            )}
          </div>

          {/* Note & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20"
            >
              Record Settle Up
            </button>
          </div>
        </form>
      </div>

      {/* Embedded UPI QR Modal */}
      <UpiQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        payeeName={toUser}
        payeeVpa={
          householdMembers.find((m) => m.name === toUser)?.upi_id ||
          (toUser.toLowerCase().includes('parth')
            ? user?.upi_id || 'parth@okaxis'
            : `${toUser.toLowerCase().replace(/\s+/g, '')}@okaxis`)
        }
        amount={parseFloat(amountStr) || 100}
        note={note}
        fromName={fromUser}
        onMarkAsSettled={() => {
          handleSubmit({ preventDefault: () => {} } as any);
        }}
      />
    </div>
  );
};
