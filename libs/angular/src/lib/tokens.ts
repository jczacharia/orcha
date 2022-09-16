import { InjectionToken } from '@angular/core';

export const ORCHA_TOKEN_LOCAL_STORAGE_KEY = new InjectionToken<string>('ORCHA_TOKEN_LOCAL_STORAGE_KEY');
export const ORCHA_API_URL = new InjectionToken<string>('ORCHA_API_URL');
export const ORCHA_TOKEN_RETRIEVER = new InjectionToken<() => string>('ORCHA_TOKEN_RETRIEVER');
