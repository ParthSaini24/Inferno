import { PaymentMode, TransactionType } from '@/types';

export interface ParsedVoiceResult {
  amount: number;
  merchant: string;
  category_id: string;
  payment_mode: PaymentMode;
  confidence: number;
  raw_transcript: string;
  notes?: string;
}

const HINDI_NUMBER_WORDS: Record<string, number> = {
  ek: 1,
  do: 2,
  teen: 3,
  chaar: 4,
  paanch: 5,
  chheh: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  gyaarah: 11,
  baarah: 12,
  pandrah: 15,
  bees: 20,
  pachees: 25,
  tees: 30,
  paithees: 35,
  chaalees: 40,
  pachaas: 50,
  saath: 60,
  sattar: 70,
  assi: 80,
  nabbe: 90,
  sau: 100,
  hazaar: 1000,
  lakh: 100000,
};

export function parseVoiceExpense(transcript: string): ParsedVoiceResult {
  const text = transcript.toLowerCase().trim();

  // 1. Extract Amount
  let amount = 0;

  // Check numeric digits first: e.g. "450", "3,200", "2000"
  const digitMatch = text.match(/(?:rs\.?|inr|₹)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)\s*(?:rupaye|rs|rupees|bucks)?/i);
  if (digitMatch && digitMatch[1]) {
    amount = parseFloat(digitMatch[1].replace(/,/g, ''));
  } else {
    // Check words like "chaar sau" or "do hazaar"
    if (text.includes('hazaar') || text.includes('hazar')) {
      const match = text.match(/([a-z]+)\s*(?:hazaar|hazar)/);
      if (match && HINDI_NUMBER_WORDS[match[1]]) {
        amount = HINDI_NUMBER_WORDS[match[1]] * 1000;
      } else {
        amount = 1000;
      }
    } else if (text.includes('sau')) {
      const match = text.match(/([a-z]+)\s*sau/);
      if (match && HINDI_NUMBER_WORDS[match[1]]) {
        amount = HINDI_NUMBER_WORDS[match[1]] * 100;
      } else {
        amount = 100;
      }
    }
  }

  // 2. Extract Payment Mode
  let payment_mode: PaymentMode = 'upi';
  if (/\b(?:cash|nakad|roka)\b/i.test(text)) {
    payment_mode = 'cash';
  } else if (/\b(?:card|credit|debit)\b/i.test(text)) {
    payment_mode = 'card';
  } else if (/\b(?:netbanking|bank transfer|account)\b/i.test(text)) {
    payment_mode = 'netbanking';
  } else {
    payment_mode = 'upi';
  }

  // 3. Extract Category and Merchant
  let merchant = 'Expense';
  let category_id = 'cat-15'; // Other Expense

  if (/\b(?:swiggy|zomato|pizza|burger|mcdonald|chai|tea|coffee|dinner|lunch|dhaba|restaurant|sutta|cafe)\b/i.test(text)) {
    category_id = 'cat-1'; // Food & Dining
    if (text.includes('swiggy')) merchant = 'Swiggy';
    else if (text.includes('zomato')) merchant = 'Zomato';
    else if (text.includes('chai') || text.includes('tea')) merchant = 'Chai Tapri';
    else if (text.includes('coffee')) merchant = 'Cafe Coffee';
    else merchant = 'Food & Dining';
  } else if (/\b(?:d-?mart|blinkit|zepto|grocer(?:y|ies)|sabzi|vegetables|milk|doodh|ration|kirana|supermarket|reliance)\b/i.test(text)) {
    category_id = 'cat-2'; // Groceries
    if (text.includes('dmart') || text.includes('d-mart')) merchant = 'D-Mart Supermarket';
    else if (text.includes('blinkit')) merchant = 'Blinkit Quick Commerce';
    else if (text.includes('zepto')) merchant = 'Zepto Groceries';
    else if (text.includes('sabzi') || text.includes('vegetable')) merchant = 'Local Vegetable Vendor';
    else if (text.includes('doodh') || text.includes('milk')) merchant = 'Mother Dairy';
    else merchant = 'Grocery Store';
  } else if (/\b(?:petrol|diesel|cng|fuel|pump)\b/i.test(text)) {
    category_id = 'cat-5'; // Fuel
    merchant = 'Indian Oil / HPCL Petrol Pump';
  } else if (/\b(?:uber|ola|rapido|auto|rickshaw|metro|cab|taxi|bus|train)\b/i.test(text)) {
    category_id = 'cat-4'; // Transport
    if (text.includes('uber')) merchant = 'Uber India';
    else if (text.includes('ola')) merchant = 'Ola Cabs';
    else if (text.includes('rapido')) merchant = 'Rapido Bike';
    else if (text.includes('auto') || text.includes('rickshaw')) merchant = 'Auto Rickshaw';
    else if (text.includes('metro')) merchant = 'Metro Rail';
    else merchant = 'Local Transport';
  } else if (/\b(?:bijli|electricity|wifi|broadband|recharge|jio|airtel|gas|cylinder|water)\b/i.test(text)) {
    category_id = 'cat-6'; // Bills & Utilities
    if (text.includes('bijli') || text.includes('electricity')) merchant = 'Electricity Bill';
    else if (text.includes('wifi') || text.includes('broadband')) merchant = 'Broadband Internet';
    else if (text.includes('jio') || text.includes('airtel') || text.includes('recharge')) merchant = 'Mobile Recharge';
    else merchant = 'Utility Bill';
  } else if (/\b(?:amazon|flipkart|myntra|zara|shopping|clothes|shoes)\b/i.test(text)) {
    category_id = 'cat-7'; // Shopping
    if (text.includes('amazon')) merchant = 'Amazon India';
    else if (text.includes('flipkart')) merchant = 'Flipkart';
    else if (text.includes('myntra')) merchant = 'Myntra Fashion';
    else merchant = 'Shopping Center';
  } else if (/\b(?:rent|kiraya|flat|society|landlord)\b/i.test(text)) {
    category_id = 'cat-3'; // Rent
    merchant = 'House Rent';
  } else if (/\b(?:medicine|apollo|pharmacy|doctor|hospital|clinic)\b/i.test(text)) {
    category_id = 'cat-8'; // Health & Medical
    merchant = 'Apollo Pharmacy';
  } else if (/\b(?:movie|cinema|pvr|inox|netflix|hotstar)\b/i.test(text)) {
    category_id = 'cat-10'; // Entertainment
    merchant = 'PVR Cinemas';
  } else if (/\b(?:puja|mandir|diwali|festival|sweets|mithai)\b/i.test(text)) {
    category_id = 'cat-11'; // Festivals & Puja
    merchant = 'Puja & Festival Spends';
  }

  // Preposition heuristic: "X pe / se / ko / par"
  const prepMatch = text.match(/([a-zA-Z\s]{2,20})\s+(?:pe|se|ko|par)\b/i);
  if (prepMatch && prepMatch[1] && merchant === 'Expense') {
    const rawWord = prepMatch[1].trim();
    if (!['maine', 'aaj', 'kal', 'abhi'].includes(rawWord)) {
      merchant = rawWord.charAt(0).toUpperCase() + rawWord.slice(1);
    }
  }

  return {
    amount: amount > 0 ? amount : 100,
    merchant,
    category_id,
    payment_mode,
    confidence: amount > 0 ? 0.95 : 0.6,
    raw_transcript: transcript,
    notes: `Voice logged: "${transcript}"`,
  };
}
