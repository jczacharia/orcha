export interface Sign {
  userId: string;
}

export abstract class AuthPort {
  abstract comparePasswords(password: string, hash: string, salt: string): Promise<boolean>;
  abstract hash(password: string, salt: string): Promise<string>;

  abstract getTokenOwner(token: string): Promise<Sign>;
  abstract sign(data: Sign): string;
}
