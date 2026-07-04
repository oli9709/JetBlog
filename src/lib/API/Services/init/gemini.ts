import { GoogleGenAI } from '@google/genai';

/** Gemini (Google AI Studio) client — API kalit orqali. */
export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY yo\'q');
  return new GoogleGenAI({ apiKey });
};

export const isGeminiConfigured = (): boolean => !!process.env.GEMINI_API_KEY;
