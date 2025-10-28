const KEY = 'solo-in-public.persona';

export type Persona = 'visionario' | 'tecnico' | 'coach' | 'default';

export const PersonaPref = {
  get(): Persona {
    if (typeof window === 'undefined') return 'default';
    try {
      const v = window.localStorage.getItem(KEY);
      if (v === 'visionario' || v === 'tecnico' || v === 'coach' || v === 'default') return v;
      return 'default';
    } catch {
      return 'default';
    }
  },
  set(value: Persona) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(KEY, value);
    } catch {}
  }
};

