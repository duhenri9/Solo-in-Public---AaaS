import { getApiBaseUrl } from '@/src/utils/runtimeConfig';

export interface BillingDetails {
  fullName: string;
  email: string;
  company: string;
  planId: string;
  leadId?: string;
}

export interface CheckoutSession {
  checkoutUrl?: string;
  customerId?: string;
  sessionId?: string;
  status: 'requires_redirect' | 'simulated';
}

export class BillingService {
  static async createCheckoutSession(details: BillingDetails): Promise<CheckoutSession> {
    const apiBaseUrl = getApiBaseUrl();
    const payload = {
      ...details,
      createdAt: new Date().toISOString()
    };

    if (apiBaseUrl) {
      const response = await fetch(`${apiBaseUrl}/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Checkout session creation failed with status ${response.status}`);
      }

      const body = await response.json().catch(() => ({}));
      return {
        checkoutUrl: body.checkoutUrl,
        customerId: body.customerId,
        sessionId: body.sessionId,
        status: 'requires_redirect'
      };
    }

    console.info('API base URL not configured. Returning simulated checkout session.');
    return {
      checkoutUrl: undefined,
      customerId: payload.email,
      status: 'simulated'
    };
  }
}
