const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    const text = response.content[0]?.text || "Sorry, kuch masla aa gaya. Dobara try karein.";
    return res.status(200).json({ text });

  } catch (error) {
    console.error("Chat API Error:", error);
    const errorMessage = error.message || "Unknown error";
    return res.status(500).json({ 
      error: "Internal server error", 
      text: `Agent Error: ${errorMessage}. (Check your Anthropic credits or API key status)` 
    });
  }
};
