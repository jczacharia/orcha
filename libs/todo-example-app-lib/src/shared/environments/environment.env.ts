import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';

export interface Env {
  production: boolean;
  host: string;
  apiUrl: string;
  mikroOrmConfig: MikroOrmModuleSyncOptions;
}
