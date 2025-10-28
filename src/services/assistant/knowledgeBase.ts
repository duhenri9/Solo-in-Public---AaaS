import knowledgeBase from '../../data/knowledgeBase.json';
import { KnowledgeBaseEntry, KnowledgeSnippet } from './types';
import { getApiBaseUrl } from '@/src/utils/runtimeConfig';

const DEFAULT_LIMIT = 3;

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const fallbackEntries = knowledgeBase as KnowledgeBaseEntry[];

const runFallbackSearch = (query: string, locale: string, limit: number): KnowledgeSnippet[] => {
  const normalizedQuery = normalize(query);
  const keywords = normalizedQuery.split(/\s+/).filter(Boolean);

  return fallbackEntries
    .filter((entry) => entry.language === locale || (entry.language === 'pt' && locale.startsWith('pt')))
    .map((entry) => {
      const normalizedContent = normalize(`${entry.title} ${entry.content} ${entry.tags.join(' ')}`);
      const matches = keywords.reduce((score, keyword) => (normalizedContent.includes(keyword) ? score + 1 : score), 0);
      const tagBoost = entry.tags.some((tag) => normalizedQuery.includes(normalize(tag))) ? 1 : 0;

      return {
        id: entry.id,
        title: entry.title,
        content: entry.content,
        category: entry.category,
        score: matches + tagBoost
      } as KnowledgeSnippet;
    })
    .filter((snippet) => snippet.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export class KnowledgeBaseClient {
  private readonly apiBaseUrl = getApiBaseUrl();

  async search(query: string, locale: string, limit: number = DEFAULT_LIMIT): Promise<KnowledgeSnippet[]> {
    if (!query.trim()) {
      return [];
    }

    if (this.apiBaseUrl) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/assistant/knowledge/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query, locale, limit })
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data?.results)) {
            return data.results as KnowledgeSnippet[];
          }
        } else {
          console.warn('Knowledge search backend responded with status', response.status);
        }
      } catch (error) {
        console.warn('Falling back to local knowledge base:', error);
      }
    }

    return runFallbackSearch(query, locale, limit);
  }
}
