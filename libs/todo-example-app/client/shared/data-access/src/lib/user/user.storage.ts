export class LocalStorageManager<T> {
  constructor(private readonly _key: string) {}

  setValue(data: T): T {
    localStorage.setItem(this._key, JSON.stringify(data));
    return data;
  }

  getValue(): T | undefined {
    const val = localStorage.getItem(this._key);
    return val ? JSON.parse(val) : undefined;
  }

  delete() {
    localStorage.removeItem(this._key);
  }
}

export const AuthTokenStorage = new LocalStorageManager<{ id: string; token: string }>(
  'orcha-todo-example-app-auth-token'
);
