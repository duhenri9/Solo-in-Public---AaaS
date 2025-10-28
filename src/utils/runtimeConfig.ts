const getImportMetaEnv = () => {
  try {
    // eslint-disable-next-line no-new-func
    const evaluator = new Function(
      'try { return (typeof import !== "undefined" && import.meta && import.meta.env) || undefined; } catch (err) { return undefined; }'
    );
    return evaluator() ?? {};
  } catch {
    return {};
  }
};

const getProcessEnv = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env;
  }
  return {};
};

const readEnv = (key: string): string | undefined => {
  const meta = getImportMetaEnv();
  if (meta && typeof meta[key] === 'string' && meta[key] !== '') {
    return meta[key];
  }

  const nodeEnv = getProcessEnv();
  if (nodeEnv && typeof nodeEnv[key] === 'string' && nodeEnv[key] !== '') {
    return nodeEnv[key];
  }

  return undefined;
};

export const getApiBaseUrl = (): string | undefined => readEnv('VITE_API_BASE_URL');

export const getStripePublishableKey = (): string | undefined =>
  readEnv('VITE_STRIPE_PUBLIC_KEY');

export const getClientAppUrl = (): string | undefined =>
  readEnv('VITE_CLIENT_APP_URL') ?? readEnv('CLIENT_APP_URL');
