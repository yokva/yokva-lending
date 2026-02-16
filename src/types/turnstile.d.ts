interface TurnstileRenderOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
}

interface TurnstileInstance {
  render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (container?: string | HTMLElement) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
  }
}

export {};
