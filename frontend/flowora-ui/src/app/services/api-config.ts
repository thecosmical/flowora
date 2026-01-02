import { InjectionToken } from '@angular/core';

export type ApiAuth = { username: string; password: string };

export type ApiConfig = {
  baseUrl: string;
  useMock?: boolean;
  auth?: ApiAuth;
};

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  factory: () => ({
    baseUrl: (globalThis as any).__API_BASE__ ?? 'http://localhost:8080',
    useMock: true,
    auth: { username: 'api', password: 'api' }
  })
});
