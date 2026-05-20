import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';

// @see https://usehooks.com/useLockBodyScroll.
export function useLockBody() {
  useLayoutEffect((): (() => void) => {
    const originalStyle: string = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = originalStyle);
  }, []);
}

/**
 * 1. Aktiv saytni saqlash
 * localStorage da 'jetblog_active_site' kalitida saqlanadi
 */
export interface ActiveSite {
  id: string;
  url: string;
  wp_username?: string;
}

export function useActiveSite() {
  const [activeSite, setActiveSiteState] = useState<ActiveSite | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jetblog_active_site');
      if (stored) {
        setActiveSiteState(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error reading active site from localStorage', err);
    }
  }, []);

  const setActiveSite = useCallback((site: ActiveSite) => {
    try {
      localStorage.setItem('jetblog_active_site', JSON.stringify(site));
      setActiveSiteState(site);
    } catch (err) {
      console.error('Error setting active site to localStorage', err);
    }
  }, []);

  const clearActiveSite = useCallback(() => {
    try {
      localStorage.removeItem('jetblog_active_site');
      setActiveSiteState(null);
    } catch (err) {
      console.error('Error clearing active site', err);
    }
  }, []);

  return { activeSite, setActiveSite, clearActiveSite };
}

/**
 * 2. Keywords fetch va filter
 * /api/keywords/fetch dan ma'lumot oladi.
 */
export interface Keyword {
  id: string;
  keyword: string;
  language: string;
  status: string;
  [key: string]: any;
}

export function useKeywords(siteId: string | null) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const [language, setLanguage] = useState<'all' | 'uz' | 'ru' | 'en'>('all');
  const [status, setStatus] = useState<'all' | 'pending' | 'approved' | 'generated'>('all');

  const fetchKeywords = useCallback(async () => {
    if (!siteId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/keywords/fetch?siteId=${siteId}`);
      if (!res.ok) throw new Error('Tarmoq xatosi yoki server xatosi');
      const data = await res.json();
      setKeywords(Array.isArray(data) ? data : (data.keywords || []));
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  const filteredKeywords = keywords.filter((kw) => {
    const langMatch = language === 'all' || kw.language === language;
    const statusMatch = status === 'all' || kw.status === status;
    return langMatch && statusMatch;
  });

  return {
    keywords,
    filteredKeywords,
    isLoading,
    error,
    language,
    setLanguage,
    status,
    setStatus,
    refresh: fetchKeywords
  };
}

/**
 * 3. Articles fetch va search
 * Supabase yoki ma'lumotlar bazasidan articles ni qaytaradi
 */
export interface Article {
  id: string;
  title: string;
  status: string;
  [key: string]: any;
}

export function useArticles(siteId: string | null) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchArticles = useCallback(async () => {
    if (!siteId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/fetch?siteId=${siteId}`);
      if (!res.ok) throw new Error('Maqolalarni yuklashda xatolik');
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : (data.articles || []));
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const filteredArticles = articles.filter((art) => {
    const queryMatch = !searchQuery || art.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = statusFilter === 'all' || art.status === statusFilter;
    return queryMatch && statusMatch;
  });

  return {
    articles,
    filteredArticles,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    refresh: fetchArticles
  };
}

/**
 * 4. Debounce hook
 * Qidiruv inputlari va kiritish tezligini pasaytirish uchun
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 5. Local storage hook
 * Type-safe localStorage wrapper
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

/**
 * 6. Auto save hook
 * Content o'zgarganda delay ms dan keyin onSave ni avtomatik ishga tushiradi
 */
export function useAutoSave(
  content: string,
  onSave: (content: string) => Promise<void>,
  delay: number = 3000
) {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debouncedContent = useDebounce(content, delay);
  const initialMount = useRef(true);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }

    let isMounted = true;
    const performSave = async () => {
      setIsSaving(true);
      try {
        await onSave(debouncedContent);
        if (isMounted) setLastSaved(new Date());
      } catch (err) {
        console.error('AutoSave failed:', err);
      } finally {
        if (isMounted) setIsSaving(false);
      }
    };

    if (debouncedContent !== undefined) {
      performSave();
    }

    return () => {
      isMounted = false;
    };
  }, [debouncedContent, onSave]);

  const saveNow = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      setLastSaved(new Date());
    } catch (err) {
      console.error('SaveNow failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [content, onSave]);

  return { isSaving, lastSaved, saveNow };
}

/**
 * 7. Credits polling
 * Har 30 sekundda credits va plan turini serverdan so'rab turadi
 */
export function useCredits(userId: string | null) {
  const [credits, setCredits] = useState<number>(0);
  const [plan, setPlan] = useState<string>('free');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCredits = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/credits?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.credits !== undefined) setCredits(data.credits);
        if (data.plan !== undefined) setPlan(data.plan);
      }
    } catch (err) {
      console.error('Failed to fetch credits:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCredits();
    
    // Polling interval
    const interval = setInterval(() => {
      fetchCredits();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCredits]);

  return { credits, plan, isLoading, refresh: fetchCredits };
}
