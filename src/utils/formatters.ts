/**
 * Format currency with Indian digit grouping (e.g. ₹1,25,000)
 */
export function formatINR(amount: number, showDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? (amount % 1 !== 0 ? 2 : 0) : 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Compact Indian currency representation (e.g. ₹1.2 L, ₹45 K, ₹2.5 Cr)
 */
export function formatCompactINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    // 1 Crore = 10,000,000
    const cr = (abs / 10000000).toFixed(2).replace(/\.00$/, '');
    return `${sign}₹${cr} Cr`;
  } else if (abs >= 100000) {
    // 1 Lakh = 100,000
    const lk = (abs / 100000).toFixed(2).replace(/\.00$/, '');
    return `${sign}₹${lk} L`;
  } else if (abs >= 1000) {
    const k = (abs / 1000).toFixed(1).replace(/\.0$/, '');
    return `${sign}₹${k} K`;
  }

  return `${sign}₹${abs}`;
}

/**
 * Format date in Indian standard DD/MM/YYYY
 */
export function formatDateIndian(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Friendly relative date label for transaction groups
 */
export function formatRelativeDate(dateInput: string | Date): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(d, today)) {
    return 'Today';
  }
  if (isSameDay(d, yesterday)) {
    return 'Yesterday';
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${monthName} ${year}`;
}

/**
 * Convert any Indian bank statement date string to YYYY-MM-DD
 */
export function normalizeDateToISO(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0];
  const cleaned = raw.trim();

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyy = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    let year = ddmmyyyy[3];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }

  // Handle DD-MMM-YYYY (e.g. 24-Oct-2024 or 24-OCT-24)
  const ddmmmyyyy = cleaned.match(/^(\d{1,2})[-/ ]([a-zA-Z]{3})[-/ ](\d{2,4})$/i);
  if (ddmmmyyyy) {
    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const day = ddmmmyyyy[1].padStart(2, '0');
    const month = monthMap[ddmmmyyyy[2].toLowerCase()] || '01';
    let year = ddmmmyyyy[3];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }

  // Fallback to standard Date parse
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}
