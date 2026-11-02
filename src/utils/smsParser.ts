import { ParsedSmsResult, PaymentMode, TransactionType } from '@/types';
import { normalizeDateToISO } from './formatters';

interface CategoryHint {
  keywords: string[];
  categoryName: string;
}

const CATEGORY_HINTS: CategoryHint[] = [
  {
    categoryName: 'Food & Dining',
    keywords: ['swiggy', 'zomato', 'mcdonald', 'burger king', 'chai point', 'starbucks', 'subway', 'dominos', 'pizza', 'kfc', 'cafe', 'restaurant', 'dhaba', 'eats', 'biryani', 'haldiram', 'barbeque']
  },
  {
    categoryName: 'Groceries',
    keywords: ['blinkit', 'zepto', 'instamart', 'bigbasket', 'dmart', 'd-mart', 'reliance fresh', 'spencers', 'nature basket', 'supermarket', 'kirana', 'milk', 'country delight', 'vegetables', 'fresho']
  },
  {
    categoryName: 'Transport',
    keywords: ['uber', 'ola', 'rapido', 'metro', 'auto', 'cab', 'taxi', 'yulu', 'chalo', 'toll', 'fastag', 'nhai', 'irctc']
  },
  {
    categoryName: 'Fuel',
    keywords: ['indian oil', 'ioc', 'iocl', 'bharat petroleum', 'bpcl', 'hpcl', 'hindustan petroleum', 'shell', 'petrol', 'fuel', 'cng', 'diesel']
  },
  {
    categoryName: 'Bills & Utilities',
    keywords: ['bescom', 'tata power', 'torrent', 'adani electricity', 'airtel', 'jio', 'vi ', 'vodafone', 'electricity', 'water', 'gas', 'indane', 'cylinder', 'broadband', 'act fibernet', 'recharge', 'billdesk', 'bbps']
  },
  {
    categoryName: 'Shopping',
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'zara', 'h&m', 'decathlon', 'croma', 'reliance digital', 'meesho', 'tatacliq', 'shoppers stop', 'lifestyle']
  },
  {
    categoryName: 'Health & Medical',
    keywords: ['apollo', '1mg', 'pharmeasy', 'medplus', 'hospital', 'clinic', 'diagnostic', 'doctor', 'dr.', 'pharmacy', 'chemist', 'lab', 'dentist']
  },
  {
    categoryName: 'Education',
    keywords: ['school', 'college', 'university', 'coursera', 'udemy', 'unacademy', 'byju', 'tuition', 'fee', 'books', 'stationery']
  },
  {
    categoryName: 'Entertainment',
    keywords: ['netflix', 'hotstar', 'spotify', 'prime video', 'primevideo', 'bookmyshow', 'pvr', 'inox', 'cinema', 'youtube', 'gaming', 'steam', 'sony liv']
  },
  {
    categoryName: 'Festivals & Puja',
    keywords: ['diwali', 'puja', 'pooja', 'temple', 'festival', 'tanishq', 'kalyan', 'sweets', 'mithai', 'crackers', 'gift', 'rakhi']
  },
  {
    categoryName: 'EMI & Loans',
    keywords: ['emi', 'loan', 'bajaj finserv', 'bajaj finance', 'home loan', 'car loan', 'credit card payment', 'cred']
  },
  {
    categoryName: 'Investments & SIP',
    keywords: ['zerodha', 'groww', 'angelone', 'upstox', 'kuvera', 'coin', 'nippon', 'mutual fund', 'sip', 'ppf', 'nps', 'uti', 'icici pru mf', 'sbi mf', 'navi']
  },
  {
    categoryName: 'Travel & Holidays',
    keywords: ['makemytrip', 'mmt', 'cleartrip', 'yatra', 'indigo', 'air india', 'hotel', 'resort', 'stay', 'oyo', 'airbnb', 'flight']
  },
  {
    categoryName: 'Salary',
    keywords: ['salary', 'payroll', 'stipend', 'wipro', 'infosys', 'tcs', 'accenture', 'google', 'microsoft', 'employer', 'ctc']
  }
];

export function guessCategoryFromMerchant(merchantOrText: string): string {
  const text = merchantOrText.toLowerCase();
  for (const hint of CATEGORY_HINTS) {
    for (const keyword of hint.keywords) {
      if (text.includes(keyword)) {
        return hint.categoryName;
      }
    }
  }
  return 'Other Expense';
}

/**
 * Robust Client-Side Regex Parser for Indian Bank & UPI SMS messages
 */
export function parseIndianFinancialSms(rawText: string): ParsedSmsResult | null {
  if (!rawText || rawText.trim().length < 10) {
    return null;
  }

  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Detect Type (Expense vs Income)
  const isIncome = /(credited|received|refunded|deposited|cashback|bonus)/i.test(lower) && 
                   !/requested|failed|pending|reversed to your a\/c/i.test(lower);
  const type: TransactionType = isIncome ? 'income' : 'expense';

  // 2. Extract Amount
  // Matches: "Rs 450", "Rs. 1,499.00", "INR 250", "debited by 500.00", "credited with INR 12000"
  let amount = 0;
  const amountPatterns = [
    /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:debited|spent|credited|paid|transferred|withdrawn|sent)\s*(?:by|for|of|with)?\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:debited|credited|spent)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleanNum = match[1].replace(/,/g, '');
      const parsed = parseFloat(cleanNum);
      if (!isNaN(parsed) && parsed > 0 && parsed < 100000000) {
        amount = parsed;
        break;
      }
    }
  }

  if (!amount) {
    return null;
  }

  // 3. Detect Payment Mode
  let payment_mode: PaymentMode = 'upi';
  if (/upi|vpa|gpay|google pay|phonepe|paytm|bhim/i.test(text)) {
    payment_mode = 'upi';
  } else if (/card|ending \d{4}|credit card|debit card/i.test(text)) {
    payment_mode = 'card';
  } else if (/netbanking|net banking|imps|neft|rtgs|ach|direct debit/i.test(text)) {
    payment_mode = 'netbanking';
  } else if (/atm|cash/i.test(text)) {
    payment_mode = 'cash';
  }

  // 4. Extract Merchant / Payee
  let merchant = '';
  
  // Patterns like: "to SWIGGY", "at ZOMATO", "info: TATA POWER", "transfer to BLINKIT", "paid to Ramesh Kumar"
  const merchantPatterns = [
    /(?:to|at|towards|for|paid to|info:|transfer to)\s+([A-Za-z0-9\s&.*'-]{2,30}?)(?:\s+(?:on|via|ref|using|avail|bal|upi|from|a\/c|dated|\.|\n|$))/i,
    /(?:vpa|upi:?)\s*([a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+)/i,
    /(?:debited from .*? to)\s+([A-Za-z0-9\s&.*'-]{2,30})/i,
    /(?:spent on .*? at)\s+([A-Za-z0-9\s&.*'-]{2,30})/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Filter out bank noise words
      if (!/^(bank|hdfc|sbi|icici|axis|kotak|account|a\/c|card|atm|branch|rs|inr|ref|bal|available)$/i.test(candidate)) {
        merchant = candidate.replace(/^[*_#]+|[*_#]+$/g, '').trim();
        break;
      }
    }
  }

  if (!merchant) {
    if (type === 'income') {
      merchant = lower.includes('salary') ? 'Salary Credit' : 'Bank Transfer / Credit';
    } else {
      merchant = payment_mode === 'upi' ? 'UPI Payee' : 'Merchant Store';
    }
  }

  // 5. Extract Date
  let date = new Date().toISOString().split('T')[0];
  const datePatterns = [
    /(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/,
    /(\d{1,2}[-/ ](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/ ]\d{2,4})/i,
    /(\d{1,2}(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\d{2,4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      date = normalizeDateToISO(match[1]);
      break;
    }
  }

  // 6. Account Reference (e.g. A/C **1234 or Card ending 8092)
  let account_ref = '';
  const acMatch = text.match(/(?:a\/c|acct|card|ending)\s*(?:no\.?)?\s*([xX*]*\d{3,4})/i);
  if (acMatch) {
    account_ref = acMatch[1];
  }

  const suggested_category_name = guessCategoryFromMerchant(`${merchant} ${text}`);

  return {
    amount,
    type,
    merchant,
    payment_mode,
    date,
    suggested_category_name,
    confidence: 0.95,
    raw_message: text,
    account_ref: account_ref || undefined,
  };
}

/**
 * Sample Indian SMS messages for 1-click testing in the UI
 */
export const SAMPLE_INDIAN_SMS = [
  {
    title: 'HDFC Bank - Swiggy (UPI)',
    text: 'Alert: Rs 450.00 debited from HDFC Bank A/c **1234 to SWIGGY on 02-Nov-26 via UPI ref 430718928391. Avl bal: INR 34,200.00.',
  },
  {
    title: 'SBI - Blinkit Groceries',
    text: 'Dear SBI User, A/C 9876 debited by Rs 849.00 on 02Nov26 transfer to BLINKIT UPI Ref No 4918239012. Bal: Rs 14,320.00',
  },
  {
    title: 'ICICI - Tata Power Electricity Bill',
    text: 'Dear Customer, INR 2,450.00 debited from ICICI Bank A/C XX442 on 01-Nov-26. Info: BIL*Tata Power*Elec. UPI: 49832049.',
  },
  {
    title: 'Axis Bank - Indian Oil Fuel (Card)',
    text: 'Axis Bank: Rs. 2,100.00 spent on credit card ending 4012 at INDIAN OIL CORP on 02-Nov-26 at 14:30. Avail Limit: Rs 1,45,000.',
  },
  {
    title: 'SBI - Monthly Salary Credit',
    text: 'Your A/C XXXX1234 credited by Rs. 95,000.00 on 31-Oct-26 by Salary/Infosys Ltd (IMPS/430482049). Total Bal: Rs 1,22,450.',
  },
];
