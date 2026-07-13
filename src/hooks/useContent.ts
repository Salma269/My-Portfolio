import { useEffect, useState } from 'react';
import { fallbackContent } from '../data/fallbackContent';
import type { PortfolioContent } from '../types/cms';

type ContentState = {
  content: PortfolioContent;
  loading: boolean;
  source: 'api' | 'fallback';
  error?: string;
};

export function useContent() {
  const [state, setState] = useState<ContentState>({ content: fallbackContent, loading: true, source: 'fallback' });

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/public/content', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Content API returned ${response.status}`);
        const data = (await response.json()) as { content?: PortfolioContent };
        if (!data.content) throw new Error('Invalid content payload');
        setState({ content: data.content, loading: false, source: 'api' });
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        setState({ content: fallbackContent, loading: false, source: 'fallback', error: error.message });
      });
    return () => controller.abort();
  }, []);

  return state;
}
