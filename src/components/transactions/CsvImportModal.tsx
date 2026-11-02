import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Category, CsvParsedRow, PaymentMode, TransactionType } from '@/types';
import { guessCategoryFromMerchant } from '@/utils/smsParser';
import { normalizeDateToISO, formatINR, formatDateIndian } from '@/utils/formatters';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import Papa from 'papaparse';
import {
  FileSpreadsheet,
  X,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_BANK_CSV = `Date,Narration,Chq/Ref No,Value Dt,Withdrawal Amt,Deposit Amt,Closing Balance
02/11/2026,UPI-SWIGGY-BANGALORE-430918239,430918239,02/11/2026,520.00,,45200.00
02/11/2026,UPI-BLINKIT-GROCERY-IND-49102931,49102931,02/11/2026,1240.00,,43960.00
01/11/2026,TATA POWER ELEC BILL-BBPS-948102,948102,01/11/2026,2150.00,,41810.00
01/11/2026,ACH CR-INFOSYS SALARY-NOV2026,981240,01/11/2026,,95000.00,136810.00
31/10/2026,POS-INDIAN OIL PETROL PUMP-CARD-4012,839102,31/10/2026,2100.00,,39710.00
30/10/2026,UPI-UBER TRIP-BANGALORE-918239,918239,30/10/2026,380.00,,39330.00
29/10/2026,NETFLIX MUMBAI ENT SUB,849102,29/10/2026,849.00,,38481.00`;

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { categories, batchAddTransactions, getCategoryByName } = useFinance();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Map, 3: Preview
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);

  // Column mappings
  const [dateCol, setDateCol] = useState('');
  const [descCol, setDescCol] = useState('');
  const [debitCol, setDebitCol] = useState('');
  const [creditCol, setCreditCol] = useState('');

  // Parsed and preview rows
  const [parsedRows, setParsedRows] = useState<CsvParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleParseCsvString = (content: string) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0 || !results.meta.fields) {
          toast.error('The CSV file appears to be empty');
          return;
        }

        const fields = results.meta.fields;
        setCsvHeaders(fields);
        setRawRows(results.data);

        // Auto-detect columns based on standard Indian bank headers
        const dateMatch = fields.find((f) => /date|value dt|txn date/i.test(f)) || fields[0];
        const descMatch = fields.find((f) => /narration|description|particulars|remarks|details/i.test(f)) || fields[1];
        const debitMatch = fields.find((f) => /withdrawal|debit|dr|expense/i.test(f)) || fields[2];
        const creditMatch = fields.find((f) => /deposit|credit|cr|income/i.test(f)) || fields[3] || '';

        setDateCol(dateMatch || '');
        setDescCol(descMatch || '');
        setDebitCol(debitMatch || '');
        setCreditCol(creditMatch || '');

        setStep(2);
        toast.success(`Loaded ${results.data.length} records. Confirm column mapping.`);
      },
      error: (err: any) => {
        toast.error('CSV Parsing Error: ' + err.message);
      },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleParseCsvString(text);
    };
    reader.readAsText(file);
  };

  const handleGeneratePreview = () => {
    if (!dateCol || !descCol || !debitCol) {
      toast.error('Please map Date, Narration and Debit columns');
      return;
    }

    const defaultCat = categories.find((c) => c.type === 'expense') || categories[0];

    const processed: CsvParsedRow[] = rawRows
      .map((row) => {
        const rawDate = row[dateCol] || '';
        const rawDesc = String(row[descCol] || '').trim();
        const rawDebit = String(row[debitCol] || '').replace(/,/g, '').trim();
        const rawCredit = creditCol ? String(row[creditCol] || '').replace(/,/g, '').trim() : '';

        const debitAmount = parseFloat(rawDebit);
        const creditAmount = parseFloat(rawCredit);

        let amount = 0;
        let type: TransactionType = 'expense';

        if (!isNaN(creditAmount) && creditAmount > 0) {
          amount = creditAmount;
          type = 'income';
        } else if (!isNaN(debitAmount) && debitAmount > 0) {
          amount = debitAmount;
          type = 'expense';
        }

        if (amount <= 0) return null;

        // Clean merchant name from bank narration (e.g. UPI-SWIGGY-BANGALORE -> Swiggy)
        let merchant = rawDesc
          .replace(/^(upi|pos|ach|neft|imps|rtgs|chq|atm)[-/*\s]+/i, '')
          .replace(/[-/*\s]+(ind|bangalore|mumbai|delhi|\d{6,})?$/i, '')
          .trim();
        if (!merchant) merchant = rawDesc;

        // Payment Mode
        let payment_mode: PaymentMode = 'upi';
        if (/card|pos/i.test(rawDesc)) payment_mode = 'card';
        else if (/ach|imps|neft|rtgs|netbanking/i.test(rawDesc)) payment_mode = 'netbanking';
        else if (/cash|atm/i.test(rawDesc)) payment_mode = 'cash';

        // Auto-categorize
        const guessedCatName = guessCategoryFromMerchant(rawDesc);
        const matched = getCategoryByName(guessedCatName);
        const suggested_category_id = matched ? matched.id : defaultCat.id;

        return {
          date: normalizeDateToISO(rawDate),
          description: rawDesc,
          amount,
          type,
          payment_mode,
          suggested_category_id,
          merchant,
          selected: true,
        };
      })
      .filter((r): r is CsvParsedRow => r !== null);

    setParsedRows(processed);
    setStep(3);
  };

  const toggleSelectAll = () => {
    const allSelected = parsedRows.every((r) => r.selected);
    setParsedRows(parsedRows.map((r) => ({ ...r, selected: !allSelected })));
  };

  const toggleRowSelect = (index: number) => {
    setParsedRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleRowCategoryChange = (index: number, newCatId: string) => {
    setParsedRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, suggested_category_id: newCatId } : r))
    );
  };

  const handleConfirmImport = async () => {
    const selectedRows = parsedRows.filter((r) => r.selected);
    if (selectedRows.length === 0) {
      toast.error('Please select at least one transaction to import');
      return;
    }

    setIsProcessing(true);
    try {
      const formatted = selectedRows.map((r) => ({
        amount: r.amount,
        type: r.type,
        category_id: r.suggested_category_id,
        payment_mode: r.payment_mode,
        merchant: r.merchant,
        note: `Imported via CSV: ${r.description}`,
        date: r.date,
        tags: ['csv-import'],
        is_shared: false,
      }));

      await batchAddTransactions(formatted);
      onClose();
    } catch (e: any) {
      toast.error('Import failed: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header - Fixed */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Import Bank Statement CSV
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className={step >= 1 ? 'text-teal-600 font-bold' : ''}>1. Upload</span>
                <span>→</span>
                <span className={step >= 2 ? 'text-teal-600 font-bold' : ''}>2. Map Columns</span>
                <span>→</span>
                <span className={step === 3 ? 'text-teal-600 font-bold' : ''}>3. Preview & Categorize</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body based on step */}
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
          {step === 1 && (
            <div className="space-y-6 text-center py-4">
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:border-teal-500 dark:hover:border-teal-400 transition bg-slate-50/50 dark:bg-slate-800/20">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 shadow-sm">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Upload your Bank Statement CSV
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  Compatible with HDFC, SBI, ICICI, Axis, Kotak, and any standard bank statement CSV export.
                </p>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold cursor-pointer shadow-md shadow-teal-600/20 transition">
                  <span>Browse CSV File</span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sample Test Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleParseCsvString(SAMPLE_BANK_CSV)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                  <span>Try with Sample HDFC Bank Statement CSV</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 text-xs text-teal-800 dark:text-teal-300">
                Confirm which columns in your CSV correspond to Date, Narration, and Amounts.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Date Column *
                  </label>
                  <select
                    value={dateCol}
                    onChange={(e) => setDateCol(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none"
                  >
                    <option value="">Select column</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Narration / Description *
                  </label>
                  <select
                    value={descCol}
                    onChange={(e) => setDescCol(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none"
                  >
                    <option value="">Select column</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Debit / Withdrawal Column *
                  </label>
                  <select
                    value={debitCol}
                    onChange={(e) => setDebitCol(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none"
                  >
                    <option value="">Select column</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Credit / Deposit Column (Optional)
                  </label>
                  <select
                    value={creditCol}
                    onChange={(e) => setCreditCol(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none"
                  >
                    <option value="">None / Not mapped</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sample Raw Row Preview */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  First Row Sample Data
                </span>
                <div className="text-xs font-mono space-y-1 text-slate-700 dark:text-slate-300">
                  {rawRows[0] &&
                    Object.entries(rawRows[0])
                      .slice(0, 5)
                      .map(([k, v]) => (
                        <div key={k} className="flex">
                          <span className="text-slate-400 w-36 truncate">{k}:</span>
                          <span className="font-semibold truncate">{String(v)}</span>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400"
                  >
                    {parsedRows.every((r) => r.selected) ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    <span>Select All ({parsedRows.length})</span>
                  </button>
                </div>

                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Selected: {parsedRows.filter((r) => r.selected).length} transactions
                </span>
              </div>

              {/* Transactions Preview Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase sticky top-0 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3 w-10"></th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Merchant / Details</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.map((row, idx) => {
                      const cat = categories.find((c) => c.id === row.suggested_category_id);
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                            !row.selected ? 'opacity-40' : ''
                          }`}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={row.selected}
                              onChange={() => toggleRowSelect(idx)}
                              className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="p-3 whitespace-nowrap font-medium text-slate-500">
                            {formatDateIndian(row.date)}
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-slate-900 dark:text-white truncate max-w-[160px]">
                              {row.merchant}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              {row.description}
                            </p>
                          </td>
                          <td className="p-3">
                            <select
                              value={row.suggested_category_id}
                              onChange={(e) => handleRowCategoryChange(idx, e.target.value)}
                              className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                            >
                              {categories
                                .filter((c) => c.type === row.type)
                                .map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td
                            className={`p-3 text-right font-black rupee-num whitespace-nowrap ${
                              row.type === 'expense'
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {row.type === 'expense' ? '-' : '+'}{formatINR(row.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              onClick={handleGeneratePreview}
              className="flex-1 py-3 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition"
            >
              <span>Preview & Auto-Categorize</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              disabled={isProcessing || parsedRows.filter((r) => r.selected).length === 0}
              onClick={handleConfirmImport}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-bold shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>
                Confirm Import ({parsedRows.filter((r) => r.selected).length} Items)
              </span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
