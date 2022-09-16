import { Inject, Injectable } from '@angular/core';
import { ORCHA_TOKEN_LOCAL_STORAGE_KEY } from './tokens';

/**
 * Class to set your Orcha auth token used in each HTTP request.
 */
@Injectable()
export class OrchaAuthTokenLocalStorage {
  constructor(@Inject(ORCHA_TOKEN_LOCAL_STORAGE_KEY) private readonly _key: string) {}

  /**
   * Puts the auth token in local storage received from the Orcha server.
   */
  setAuthToken(token: string) {
    localStorage.setItem(this._key, token);
  }

  /**
   * Retrieves the auth token in local storage or null if not stored.
   */
  getToken(): string | null {
    return localStorage.getItem(this._key);
  }

  /**
   * Deletes the auth token in local storage.
   */
  deleteToken() {
    localStorage.removeItem(this._key);
  }
}
