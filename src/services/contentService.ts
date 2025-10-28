import { getApiBaseUrl } from '@/src/utils/runtimeConfig';

export interface GeneratedPost {
  id: string;
  content: string;
  persona: string;
  locale: string;
  createdAt: string;
  approved: boolean;
}

export class ContentService {
  private static api() {
    return getApiBaseUrl() || '';
  }

  static async listPosts() {
    const res = await fetch(`${this.api()}/content/posts`);
    const data = await res.json();
    return (data.posts || []) as GeneratedPost[];
  }

  static async getLimits() {
    const res = await fetch(`${this.api()}/content/limits`);
    return res.json() as Promise<{ allowedPerMonth: number; used: number; remaining: number }>;
  }

  static async generatePost(input: { topic?: string; persona?: string; locale?: string }) {
    const res = await fetch(`${this.api()}/content/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!res.ok) throw new Error(`Failed to generate post (${res.status})`);
    return res.json() as Promise<{ post: GeneratedPost; remaining: number }>;
  }

  static async approvePost(id: string) {
    const res = await fetch(`${this.api()}/content/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) throw new Error(`Failed to approve post (${res.status})`);
    return res.json() as Promise<{ post: GeneratedPost }>;
  }

  static async getCalendar(locale: string) {
    const url = `${this.api()}/content/calendar?locale=${encodeURIComponent(locale)}`;
    const res = await fetch(url);
    return res.json() as Promise<{ suggestions: Array<{ date: string; slot: string; reason: string }> }>;
  }
}

