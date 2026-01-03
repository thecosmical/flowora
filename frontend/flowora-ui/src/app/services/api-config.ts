import { InjectionToken } from '@angular/core';

export type ApiAuth = { username: string; password: string };

export type ApiConfig = {
  baseUrl: string;
  useMock?: boolean;
  auth?: ApiAuth;
};

const coerceBoolean = (value: any, fallback: boolean) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return fallback;
};

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  factory: () => ({
    baseUrl: (globalThis as any).__API_BASE__ ?? 'http://localhost:8080',
    useMock: coerceBoolean((globalThis as any).__API_USE_MOCK__, true),
    auth: (globalThis as any).__API_AUTH__ ?? { username: 'api', password: 'api' }
  })
});
