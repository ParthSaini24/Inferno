import QRCode from 'qrcode';

export interface UpiPaymentDetails {
  vpa: string; // e.g. parth@okaxis
  payeeName: string; // e.g. Parth Saini
  amount: number; // e.g. 4200.00
  note?: string; // e.g. Rent & Groceries Share
  transactionRef?: string;
}

/**
 * Builds standard NPCI UPI URI string.
 * Example: upi://pay?pa=parth@okaxis&pn=Parth%20Saini&am=4200.00&cu=INR&tn=Settlement
 */
export function buildUpiUri(details: UpiPaymentDetails): string {
  const { vpa, payeeName, amount, note = 'PaisaPilot Settlement', transactionRef } = details;
  const cleanVpa = vpa.trim().toLowerCase();
  const cleanName = payeeName.trim();
  const cleanAmount = Number(amount).toFixed(2);
  const cleanNote = note.trim();
  const tr = transactionRef || `PP${Date.now().toString().slice(-8)}`;

  const params = new URLSearchParams();
  params.set('pa', cleanVpa);
  params.set('pn', cleanName);
  params.set('am', cleanAmount);
  params.set('cu', 'INR');
  params.set('tn', cleanNote);
  params.set('tr', tr);

  return `upi://pay?${params.toString()}`;
}

/**
 * Validates standard Indian Virtual Payment Address (VPA) / UPI ID.
 * Common formats: username@okaxis, 9876543210@paytm, name@okhdfcbank, name@ybl, name@ibl
 */
export function isValidUpiId(vpa: string): boolean {
  if (!vpa || typeof vpa !== 'string') return false;
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,}$/;
  return upiRegex.test(vpa.trim());
}

/**
 * Generates high-resolution QR code data URL from a UPI URI.
 */
export async function generateUpiQrDataUrl(upiUri: string, size = 320): Promise<string> {
  try {
    return await QRCode.toDataURL(upiUri, {
      width: size,
      margin: 2,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate UPI QR Code:', err);
    throw err;
  }
}

/**
 * Formats deep link for specific Indian payment apps.
 */
export function getAppIntentUrl(app: 'generic' | 'gpay' | 'phonepe' | 'paytm' | 'bhim', upiUri: string): string {
  switch (app) {
    case 'phonepe':
      return upiUri.replace('upi://pay', 'phonepe://pay');
    case 'paytm':
      return upiUri.replace('upi://pay', 'paytmmp://pay');
    case 'gpay':
      return upiUri.replace('upi://pay', 'gpay://upi/pay');
    case 'bhim':
      return upiUri.replace('upi://pay', 'bhim://pay');
    case 'generic':
    default:
      return upiUri;
  }
}
