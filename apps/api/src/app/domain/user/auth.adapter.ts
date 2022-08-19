import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPort, Sign } from '@todo-example-app-lib/server';
import { FirebaseScrypt } from 'firebase-scrypt';

@Injectable()
export class AuthAdapter implements AuthPort {
  constructor(private readonly _jwtService: JwtService) {}

  readonly scrypt = new FirebaseScrypt({
    memCost: 14,
    rounds: 8,
    saltSeparator: 'Bw==',
    signerKey: 'qUmhMeByCl+H+YaT4RlH/kri/BLQEkCRrySxVqrODKR8MIhwU49k3WzyZJtr1R3dgQXDPq+7LUmIs+vuFdp8Nw==',
  });

  comparePasswords(password: string, hash: string, salt: string): Promise<boolean> {
    return this.scrypt.verify(password, salt, hash);
  }

  hash(password: string, salt: string): Promise<string> {
    return this.scrypt.hash(password, salt);
  }

  async getTokenOwner(token: string): Promise<Sign> {
    return this._jwtService.verifyAsync(token);
  }

  sign(data: Sign): string {
    return this._jwtService.sign(data);
  }
}
