import { LeadCaptureService, LeadCaptureForm } from '@/src/services/leadCaptureService';
import { BillingService } from '@/src/services/billingService';

const createForm = (): LeadCaptureForm => ({
  fullName: 'Jane Founder',
  email: 'jane@example.com',
  company: 'Solo Co',
  role: 'CEO',
  primaryGoal: 'content',
  urgency: 'soon',
  notes: 'Looking for automation'
});

describe('LeadCaptureService', () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };
  const originalCrypto = global.crypto;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: () => 'lead-local'
      },
      configurable: true
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    if (originalFetch) {
      global.fetch = originalFetch;
    } else {
      // @ts-ignore
      delete global.fetch;
    }
    if (originalCrypto) {
      Object.defineProperty(global, 'crypto', {
        value: originalCrypto,
        configurable: true
      });
    }
    process.env = { ...originalEnv };
  });

  it('submits lead to backend and returns server id', async () => {
    process.env.VITE_API_BASE_URL = 'https://api.example.com';
    const mockResponse = {
      ok: true,
      json: async () => ({ id: 'lead-remote', status: 'synced' })
    } as Response;

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const result = await LeadCaptureService.submitLead(createForm());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/leads',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.id).toBe('lead-remote');
    expect(result.status).toBe('synced');
  });

  it('falls back to local storage when backend is unavailable', async () => {
    process.env.VITE_API_BASE_URL = 'https://api.example.com';
    global.fetch = jest.fn().mockRejectedValue(new Error('Network down'));

    const result = await LeadCaptureService.submitLead(createForm());

    expect(result.id).toBeDefined();
    expect(result.status).toBe('queued');
  });
});

describe('BillingService', () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    jest.resetAllMocks();
    if (originalFetch) {
      global.fetch = originalFetch;
    } else {
      // @ts-ignore
      delete global.fetch;
    }
    process.env = { ...originalEnv };
  });

  it('returns checkout session data from backend', async () => {
    process.env.VITE_API_BASE_URL = 'https://api.example.com';
    const mockResponse = {
      ok: true,
      json: async () => ({
        checkoutUrl: 'https://stripe.example/checkout',
        customerId: 'cus_123',
        sessionId: 'cs_test_123',
        status: 'requires_redirect'
      })
    } as Response;

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const result = await BillingService.createCheckoutSession({
      fullName: 'Jane Founder',
      email: 'jane@example.com',
      company: 'Solo Co',
      planId: 'pro-founder-monthly'
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/billing/checkout',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.status).toBe('requires_redirect');
    expect(result.checkoutUrl).toBe('https://stripe.example/checkout');
    expect(result.sessionId).toBe('cs_test_123');
  });

  it('returns simulated session when backend is missing', async () => {
    delete process.env.VITE_API_BASE_URL;
    const result = await BillingService.createCheckoutSession({
      fullName: 'Jane Founder',
      email: 'jane@example.com',
      company: 'Solo Co',
      planId: 'pro-founder-monthly'
    });

    expect(result.status).toBe('simulated');
    expect(result.customerId).toBe('jane@example.com');
  });
});
