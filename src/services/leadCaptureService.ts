import { getApiBaseUrl } from '@/src/utils/runtimeConfig';

export interface LeadCaptureForm {
  fullName: string;
  email: string;
  company: string;
  role: string;
  primaryGoal: string;
  urgency: string;
  notes: string;
  consent: boolean;
}

export interface LeadSubmissionResult {
  id: string;
  status: 'synced' | 'queued';
  submittedAt: string;
}

interface StoredLead extends LeadCaptureForm {
  id: string;
  submittedAt: string;
  status: LeadSubmissionResult['status'];
}

const STORAGE_KEY = 'solo-in-public.lead-profile';

const getStorage = () => {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage;
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `lead_${Math.random().toString(36).slice(2, 10)}`;
};

export class LeadCaptureService {
  static getCachedLead(): StoredLead | null {
    const storage = getStorage();
    if (!storage) return null;

    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as StoredLead;
    } catch (error) {
      console.warn('Failed to parse cached lead profile', error);
      return null;
    }
  }

  static clearCachedLead() {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(STORAGE_KEY);
  }

  private static cacheLead(lead: StoredLead) {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(STORAGE_KEY, JSON.stringify(lead));
  }

  static async submitLead(form: LeadCaptureForm): Promise<LeadSubmissionResult> {
    const timestamp = new Date().toISOString();
    const basePayload: StoredLead = {
      id: generateId(),
      submittedAt: timestamp,
      status: 'queued',
      ...form
    };

    const apiBaseUrl = getApiBaseUrl();
    let leadRecord: StoredLead = basePayload;

    if (apiBaseUrl) {
      try {
        const response = await fetch(`${apiBaseUrl}/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...form,
            leadId: basePayload.id,
            consent: form.consent,
            submittedAt: timestamp,
            source: 'solo-in-public-web'
          })
        });

        if (!response.ok) {
          throw new Error(`Lead submission failed with status ${response.status}`);
        }

        const responseBody = await response.json().catch(() => ({}));
        const resolvedId = responseBody.id ?? responseBody.leadId ?? basePayload.id;
        const resolvedStatus: LeadSubmissionResult['status'] = responseBody.status ?? 'synced';

        leadRecord = {
          ...basePayload,
          id: resolvedId,
          status: resolvedStatus
        };
      } catch (error) {
        console.warn('Lead submission will be retried later', error);
        leadRecord = basePayload;
      }
    } else {
      console.info('API base URL not configured. Lead will be stored locally until backend is connected.');
    }

    this.cacheLead(leadRecord);

    return {
      id: leadRecord.id,
      status: leadRecord.status,
      submittedAt: timestamp
    };
  }
}
