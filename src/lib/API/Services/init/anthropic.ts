import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic SDK mijozini (Claude 3.5 Sonnet modeli uchun) boshlang'ich sozlash
 */
export const getAnthropicClient = (): Anthropic => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Agar API key qo'yilmagan bo'lsa, xatolik beradi yoki simulyatsiya uchun test API kalitini beradi
    return new Anthropic({
      apiKey: 'dummy_anthropic_api_key_for_testing'
    });
  }
  return new Anthropic({
    apiKey: apiKey
  });
};
