import 'server-only';

export async function fetchKeywordData(
  keyword: string,
  language: string
): Promise<{ search_volume: number; difficulty: number; trend: string }> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password ||
      login === 'your_dataforseo_login' ||
      password === 'your_dataforseo_password') {
    return generateMockData(keyword);
  }

  try {
    const credentials = Buffer.from(`${login}:${password}`).toString('base64');

    const response = await fetch(
      'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{
          keywords: [keyword],
          language_code: language === 'uz' ? 'uz' : language === 'ru' ? 'ru' : 'en',
          location_code: language === 'uz' ? 2158 : language === 'ru' ? 2643 : 2840
        }])
      }
    );

    if (!response.ok) {
      return generateMockData(keyword);
    }

    const data = await response.json();
    const result = data?.tasks?.[0]?.result?.[0];

    if (!result) {
      return generateMockData(keyword);
    }

    return {
      search_volume: result.search_volume ?? 0,
      difficulty: result.competition_index ?? 0,
      trend: result.monthly_searches?.length > 0 ? 'up' : 'stable'
    };

  } catch (error) {
    console.error('DataForSEO error:', error);
    return generateMockData(keyword);
  }
}

function generateMockData(keyword: string) {
  const wordCount = keyword.split(' ').length;
  const baseVolume = wordCount === 1 ? 8000 : wordCount === 2 ? 3500 : 1200;
  const variance = Math.floor(Math.random() * 2000);

  return {
    search_volume: baseVolume + variance,
    difficulty: Math.floor(Math.random() * 60) + 10,
    trend: Math.random() > 0.5 ? 'up' : 'stable'
  };
}
