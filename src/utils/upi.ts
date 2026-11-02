import QRCode from 'qrcode';

export interface UpiPaymentDetails {
  vpa: string; // e.g. parth@okaxis
  payeeName: string; // e.g. Parth Saini
  amount: number; // e.g. 4200.00
  note?: string; // e.g. Rent & Groceries Share
  transactionRef?: string;
}

const qrCache = new Map<string, string>();

/**
 * Builds standard NPCI UPI URI string deterministically.
 * Example: upi://pay?pa=parth@okaxis&pn=Parth%20Saini&am=4200.00&cu=INR&tn=Settlement
 */
export function buildUpiUri(details: UpiPaymentDetails): string {
  const { vpa, payeeName, amount, note = 'PaisaPilot Settlement', transactionRef } = details;
  const cleanVpa = (vpa || 'parth@okaxis').trim().toLowerCase();
  const cleanName = (payeeName || 'PaisaPilot User').trim();
  const cleanAmount = Number(amount || 0).toFixed(2);
  const cleanNote = (note || 'PaisaPilot Settlement').trim();

  const params = new URLSearchParams();
  params.set('pa', cleanVpa);
  params.set('pn', cleanName);
  params.set('am', cleanAmount);
  params.set('cu', 'INR');
  params.set('tn', cleanNote);
  if (transactionRef) {
    params.set('tr', transactionRef);
  }

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
 * Generates high-resolution QR code data URL from a UPI URI with memoized caching and SVG fallback.
 */
export async function generateUpiQrDataUrl(upiUri: string, size = 320): Promise<string> {
  const cacheKey = `${upiUri}_${size}`;
  if (qrCache.has(cacheKey)) {
    return qrCache.get(cacheKey)!;
  }

  try {
    const dataUrl = await QRCode.toDataURL(upiUri, {
      width: size,
      margin: 2,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    qrCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (err) {
    console.warn('Canvas toDataURL failed, attempting SVG fallback:', err);
    try {
      const svgString = await QRCode.toString(upiUri, {
        type: 'svg',
        width: size,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
      qrCache.set(cacheKey, svgDataUrl);
      return svgDataUrl;
    } catch (svgErr) {
      console.error('All QR generation methods failed:', svgErr);
      const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
        upiUri
      )}`;
      return fallbackUrl;
    }
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
