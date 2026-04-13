exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    const { messages } = JSON.parse(event.body);
    const API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Anthropic API Key is not configured in Netlify environment variables.' })
      };
    }

    // Call Anthropic API using native fetch (available in Node 18+)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: `You are the Digital Dustak 'Celestial Agent'. 
        You are a friendly, visionary, and professional representative of Digital Dustak, a top-tier video marketing agency.
        Your tone is premium, tech-savvy, and helpful.
        
        AGENCY DETAILS:
        - Founder: Mohsin (Expert Video Editor/Strategist).
        - Services: Premium Video Editing, Talking Head Videos, Faceless Content, VSL (Video Sales Letters), and Brand Scaling.
        - Goal: To help brands scale through high-conversion video content.
        
        RULES:
        1. Always match the user's language. If they ask in Urdu/Roman Urdu, reply in Urdu. If in English, reply in English.
        2. Be concise but warm.
        3. Mention Mohsin bhai as the lead expert if someone asks about the team.
        4. If a user wants to book, guide them to the 'Contact' page or sections.`,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API Error:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'AI Error', details: data })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: data.content[0].text
      }),
    };

  } catch (error) {
    console.error('Function Error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: 'Internal Server Error' }) 
    };
  }
};
