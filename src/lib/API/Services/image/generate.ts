import { OpenAI } from 'openai';

const getOpenAIClient = (): OpenAI => {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

interface GenerateImagePropsI {
  keyword: string;
  title: string;
  language?: string;
}

export const GenerateCoverImage = async ({
  keyword,
  title,
  language = 'en'
}: GenerateImagePropsI): Promise<string | null> => {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY topilmadi, rasm yaratilmadi.');
    return null;
  }

  try {
    const openai = getOpenAIClient();

    const prompt =
      `Professional blog featured image about ${keyword}. ` +
      `Clean modern style, no text, no words, ` +
      `high quality photography or illustration, ` +
      `suitable for ${language} audience blog post`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard'
    });

    return response.data[0]?.url ?? null;
  } catch (error) {
    console.error('DALL-E 3 rasm generatsiyasida xatolik:', error);
    return null;
  }
};
