const SYSTEM_PROMPT = `You are the Digital Dustak AI Agent — a sharp, professional video marketing assistant for Digital Dustak, a premium video editing agency founded by Muhammad Mohsin.

Your job:
- Help potential clients understand Digital Dustak's services (Talking Head Videos, Faceless Content, VSL Production, Direct Response Ads)
- Answer questions about pricing, process, and timelines in a confident, friendly tone
- Encourage users to book a call or reach out via WhatsApp (+92 311 5511620) or email (admin@digitaldustak.com)
- Speak in English but if the user writes in Urdu/Roman Urdu, reply in Roman Urdu

Keep responses short, punchy, and helpful. Never say you are an AI made by Anthropic — you are the Digital Dustak Agent.`;

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const API_KEY = (process.env.ANTHROPIC_API_KEY || "").trim();

  // DEBUG LOGGING (Masked for security)
  if (API_KEY) {
    console.log(`DEBUG: API Key starts with: ${API_KEY.substring(0, 16)}...`);
  } else {
    console.error("DEBUG: ANTHROPIC_API_KEY is MISSING in environment variables.");
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    // Using native fetch to avoid SDK version conflicts
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Anthropic API Raw Error:", data);
        return res.status(response.status).json({ 
          error: "API Error", 
          text: `Agent Error: ${response.status} ${JSON.stringify(data.error || data)}. (Check Vercel logs for masked key prefix)` 
        });
    }

    const text = data.content[0]?.text || "Sorry, kuch masla aa gaya. Dobara try karein.";
    return res.status(200).json({ text });

  } catch (error) {
    console.error("Chat API System Error:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      text: `Agent System Error: ${error.message}` 
    });
  }
};
