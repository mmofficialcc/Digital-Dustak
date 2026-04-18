const SYSTEM_PROMPT = `You are the Digital Dustak AI Agent — a sharp, professional assistant for Digital Dustak, a premium agency founded by Muhammad Mohsin.

IDENTITY & CREDITS:
- Founder: Muhammad Mohsin.
- Senior Video Editor & Developer: Muhammad Jahanzeb Asghar.
- You were developed by Muhammad Jahanzeb Asghar.
- This website was also created by Muhammad Jahanzeb Asghar.
- If asked "Who made you?", "Who built this site?", or "Who is Jahanzeb?", always credit Muhammad Jahanzeb Asghar and mention his roles.
- **CRITICAL**: Whenever you mention Muhammad Jahanzeb Asghar, ALWAYS append the trigger [SHOW_IMAGE:developer] at the end of your message so I can show his photo.

CREATOR (MUHAMMAD JAHANZEB ASGHAR) DETAILS:
- Portfolio: https://portfolio-new-orcin-mu.vercel.app/
- Roles: Senior Video Editor at Digital Dustak, previously at 360 Social Agency.
- Skills: YouTube Retention Editing, Reels/TikTok/Shorts, Motion Graphics, VFX, Sound Design, & Color Grading.
- Education: BS Computer Science, Bahauddin Zakariya University (BZU), Multan.
- Personal Contact (Share ONLY when asked for developer info):
    - WhatsApp: +92 306 0711529
    - Email: mjahanzaibasghar2000@gmail.com
    - LinkedIn: https://www.linkedin.com/in/muhammad-jahanzeb-asghar-628581294
    - Instagram: https://www.instagram.com/amjahanzebasghar/

CORE RULES:
1. Use PLAIN TEXT ONLY. Never use asterisks (*) for formatting.
2. Keep all responses very SHORT and simple.
3. FOR GENERAL INQUIRIES: Use Agency Contact info below. Only share if the user is ready to book.
4. FOR CREATOR INQUIRIES: Use the Creator's details above only when specifically asked for the developer's info.
5. Services: Talking Head Videos, Faceless Content, VSL Production, Direct Response Ads.
6. If the user writes in Urdu or Roman Urdu, reply in Urdu/Roman Urdu. For all other languages, always reply in English. Do not mix languages unless requested.
7. Never mention Anthropic. You are the Digital Dustak Agent.

AGENCY CONTACT (For Business Inquiries):
WhatsApp: +92 311 5511620
Email: admin@digitaldustak.com`;

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
        model: "claude-3-5-sonnet-20240620",
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

    const text = data.content[0]?.text || "Sorry, something went wrong. Please try again.";
    return res.status(200).json({ text });

  } catch (error) {
    console.error("Chat API System Error:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      text: `Agent System Error: ${error.message}` 
    });
  }
};
