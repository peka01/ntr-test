/**
 * Translation Service using DeepL API
 * Provides automatic translation between Swedish and English
 */

interface DeepLTranslationResponse {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}

class TranslationService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api-free.deepl.com/v2'; // Use api.deepl.com for paid plans

  constructor() {
    // Get API key from environment
    this.apiKey = (import.meta as any).env?.VITE_DEEPL_API_KEY || null;
  }

  /**
   * Check if DeepL translation is available
   */
  isAvailable(): boolean {
    return this.apiKey !== null && this.apiKey.trim() !== '';
  }

  /**
   * Translate text using DeepL API
   * @param text - Text to translate
   * @param sourceLang - Source language code ('sv' or 'en')
   * @param targetLang - Target language code ('sv' or 'en')
   * @returns Translated text
   */
  async translate(
    text: string,
    sourceLang: 'sv' | 'en',
    targetLang: 'sv' | 'en'
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('DeepL API key not configured. Please add VITE_DEEPL_API_KEY to your .env file');
    }

    if (sourceLang === targetLang) {
      return text; // No translation needed
    }

    if (!text || text.trim() === '') {
      return text;
    }

    try {
      // DeepL uses uppercase language codes
      const sourceCode = sourceLang.toUpperCase();
      const targetCode = targetLang === 'en' ? 'EN-US' : 'SV'; // DeepL uses EN-US or EN-GB for English

      // Use our API proxy to avoid CORS issues
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          source_lang: sourceCode,
          target_lang: targetCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Translation API error:', response.status, errorData);
        throw new Error(errorData.message || `Translation failed: ${response.status}`);
      }

      const data: DeepLTranslationResponse = await response.json();
      
      if (data.translations && data.translations.length > 0) {
        return data.translations[0].text;
      }

      throw new Error('No translation returned from API');
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  /**
   * Translate markdown content with progress updates
   * Useful for large documents
   */
  async translateMarkdown(
    markdown: string,
    sourceLang: 'sv' | 'en',
    targetLang: 'sv' | 'en',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('DeepL API key not configured');
    }

    // For now, translate as one chunk
    // In the future, we could split into sections for better progress tracking
    if (onProgress) onProgress(0);

    const translated = await this.translate(markdown, sourceLang, targetLang);

    if (onProgress) onProgress(100);

    return translated;
  }

  /**
   * Get usage statistics from DeepL (if available)
   */
  async getUsageStats(): Promise<{ character_count: number; character_limit: number } | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/usage?auth_key=${this.apiKey}`, {
        method: 'GET'
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching DeepL usage stats:', error);
    }

    return null;
  }
}

// Export singleton instance
export const translationService = new TranslationService();
