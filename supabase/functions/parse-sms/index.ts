import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()
    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('LOVABLE_AI_KEY')

    if (geminiApiKey) {
      // Prompt Gemini to extract structured Indian finance SMS info
      const prompt = `You are an expert at parsing Indian financial SMS and UPI notifications (from HDFC, SBI, ICICI, Axis, Kotak, Paytm, PhonePe, Google Pay, CRED).
Given the following SMS text, extract:
- amount: number (e.g. 450.00)
- type: 'expense' | 'income' (debited / spent / paid = 'expense', credited / received = 'income')
- merchant: clean merchant or payee name (e.g., 'SWIGGY', 'Zomato', 'Zepto', 'Amazon', 'Airtel')
- payment_mode: 'upi' | 'card' | 'netbanking' | 'cash'
- date: YYYY-MM-DD (assume current year if missing)
- suggested_category: one of ['Food & Dining', 'Groceries', 'Transport', 'Fuel', 'Bills & Utilities', 'Shopping', 'Health & Medical', 'Entertainment', 'EMI & Loans', 'Investments & SIP', 'Salary', 'Other Expense']

SMS Text: "${text}"

Respond ONLY with a valid JSON object matching this schema:
{
  "amount": number,
  "type": "expense" | "income",
  "merchant": string,
  "payment_mode": "upi" | "card" | "netbanking" | "cash",
  "date": "YYYY-MM-DD",
  "suggested_category": string
}`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      })

      if (response.ok) {
        const data = await response.json()
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (textContent) {
          const parsed = JSON.parse(textContent)
          return new Response(JSON.stringify({ success: true, data: parsed, engine: 'gemini' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }
    }

    // Fallback: server-side regex parser for Indian bank SMS formats
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'LLM Key not set or failed; client regex parser will handle it.',
      fallback: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
