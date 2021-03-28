import { IParser } from './parser';
import { IExactQuery, IQuery } from './query';

/**
 * Creates a type-safe query model. Note this is a curried function to get around Typescript limitations.
 *
 * @example
 * ```typescript
 * export const UserQueryModel = createQueryModel<User>()({
 *   id: true,
 *   name: true,
 *   items: {
 *     id: true,
 *     title: true,
 *   }
 * });
 * ```
 */
export const createQueryModel = <T>() => <Q extends IQuery<T>>(query: IExactQuery<T, Q>) => query as Q;

/**
 * Defines a business logic/rule/calculation based on the given query model.
 *
 * @example
 * ```typescript
 * const calculateVoucherState = createLogic<Voucher>()({ dateRedeemed: true, dateRefunded: true })(
 *   (voucher) => {
 *     if (voucher.dateRedeemed) return 'redeemed';
 *     if (voucher.dateRefunded) return 'refunded';
 *     return 'active';
 *   }
 * );
 * const voucherStatus = calculateVoucherState(voucher);
 * ```
 *
 * You can also insert extra parameters for robust calculations.
 * ```typescript
 * const compareVoucherCode = createLogic<Voucher>()({ code: true })(
 *   (voucher, compare: number) => voucher.code === compare
 * );
 * const isVoucher999 = compareVoucherCode(voucher, 999);
 * ```
 *
 * @returns The function defined in the third curried function argument.
 */
export const createLogic = <T>() => <Q extends IQuery<T>>(query: IExactQuery<T, Q>) => <
  R,
  K extends unknown[]
>(
  func: (model: IParser<T, typeof query>, ...a: K) => R
) => func;
