// API route for proxying DeepL translation requests
// This avoids CORS issues by making the request server-side

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const DEEPL_API_KEY = process.env.VITE_DEEPL_API_KEY;

  // Check if API key is configured
  if (!DEEPL_API_KEY) {
    return res.status(503).json({ 
      error: 'Translation service not configured',
      message: 'DeepL API key is not set in environment variables'
    });
  }

  try {
    const { text, source_lang, target_lang } = req.body;

    // Validate input
    if (!text || !source_lang || !target_lang) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'text, source_lang, and target_lang are required'
      });
    }

    // Make request to DeepL API
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        source_lang: source_lang,
        target_lang: target_lang,
        preserve_formatting: true,
        tag_handling: 'xml',
        formality: 'default'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `DeepL API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return translated text
    return res.status(200).json({
      translations: data.translations
    });

  } catch (error: any) {
    console.error('Translation proxy error:', error);
    return res.status(500).json({ 
      error: 'Translation failed',
      message: error.message || 'Unknown error occurred'
    });
  }
}
