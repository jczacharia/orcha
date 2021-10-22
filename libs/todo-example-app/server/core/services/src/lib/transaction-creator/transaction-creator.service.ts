/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { runOnTransactionCommit, Transactional } from 'typeorm-transactional-cls-hooked';

/**
 * Performs database transactions (ACID compliance).
 */
export class DbTransactionCreator {
  async run<T>(task: () => Promise<T>): Promise<T> {
    return new Promise(async (res: any, rej) => {
      try {
        return await this._transact(task, res);
      } catch (e) {
        rej(e);
      }
    });
  }

  @Transactional()
  private async _transact<T>(task: () => Promise<T>, res: () => void): Promise<void> {
    await task();
    runOnTransactionCommit(res);
  }
}
