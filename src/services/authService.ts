import { getApiBaseUrl, getClientAppUrl } from '@/src/utils/runtimeConfig';

interface OAuthResult {
  provider: string;
  status: 'success' | 'error';
  message?: string;
}

export class AuthService {
  static startLinkedInOAuth(leadId?: string): void {
    const apiBaseUrl = getApiBaseUrl();
    const redirectUrl = getClientAppUrl() ?? (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : undefined);

    if (apiBaseUrl && redirectUrl) {
      const url = new URL(`${apiBaseUrl}/auth/linkedin`);
      url.searchParams.set('redirect_uri', redirectUrl);
      if (leadId) {
        url.searchParams.set('lead_id', leadId);
      }
      window.location.href = url.toString();
      return;
    }

    console.info('API base URL not configured. Simulating LinkedIn OAuth callback.');
    const fakeEvent = new CustomEvent('auth:linkedin:succeed', {
      detail: {
        name: 'Founder',
        avatar: '',
        connectedAt: new Date().toISOString()
      }
    });
    window.dispatchEvent(fakeEvent);
  }

  static consumeOAuthResult(locationSearch: string): OAuthResult | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const params = new URLSearchParams(locationSearch);
    const provider = params.get('oauth');
    if (!provider) {
      return null;
    }

    const statusParam = params.get('status');
    const message = params.get('message') ?? undefined;

    return {
      provider,
      status: statusParam === 'error' ? 'error' : 'success',
      message
    };
  }
}
