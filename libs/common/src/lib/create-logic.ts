/* eslint-disable @typescript-eslint/no-unused-vars */

import { IParser } from './parser';
import { IExactQuery, IQuery } from './query';

/**
 * Defines a business logic/rule/calculation based on the given query template model.
 * This is useful when your queried data might not be complete in its entirety.
 *
 * This way you can create a business logic function that requires the minimum data required
 * for the calculation.
 *
 * @example
 * ```typescript
 * export const calculateVoucherStatus = createLogic<
 *   Voucher,
 *   { dateRedeemed: true; dateRefunded: true }
 * >()((voucher) => {
 *     if (voucher.dateRedeemed) return 'redeemed';
 *     if (voucher.dateRefunded) return 'refunded';
 *     return 'active';
 *   }
 * );
 * const voucherStatus = calculateVoucherStatus({ dateRedeemed: null, dateRefunded: new Date() }); // refunded
 * ```
 *
 * You can also insert extra parameters for robust calculations.
 * @example
 * ```typescript
 * const compareVoucherCode = createLogic<Voucher>()({ code: true })(
 *   (voucher, compare: number) => voucher.code === compare
 * );
 * const isVoucher999_1 = compareVoucherCode({ code: 999 }, 999); // true
 * const isVoucher999_2 = compareVoucherCode({ code: 231 }, 999); // false
 * ```
 *
 * You can also compare two entities using currying.
 * @example
 * ```typescript
 * export const calcCompareTwoVouchers = createLogic<Voucher>()({ id: true })(
 *   (todo) => (compare: typeof todo) => todo.id === compare.id
 * );
 * const compareTwoVouchers = calcCompareTwoVouchers({ id: '1' })({ id: '1' }); // true
 * const compareTwoVouchers = calcCompareTwoVouchers({ id: '1' })({ id: 'other' }); // false
 * ```
 *
 * You can also curry `createLogic` functions!
 * @example
 * export const calcUserHasVoucher = createLogic<Voucher>()({ id: true })((voucher) =>
 *   createLogic<User>()({ vouchers: { id: true } })((user) => user.vouchers.some((v) => v.id === voucher.id))
 * );
 * const userHasVoucher1 = calcUserHasVoucher({ id: 'voucherId' })({ vouchers: [{ id: 'voucherId' }] }); // true
 * const userHasVoucher2 = calcUserHasVoucher({ id: 'voucherId' })({ vouchers: [{ id: 'otherId' }] }); // false
 *
 * @returns The function defined in the third curried function argument.
 */
export const createLogic =
  <T>() =>
  <Q extends IQuery<T>>(query: IExactQuery<T, Q>) =>
  <R, K extends unknown[]>(func: (model: IParser<T, Q>, ...a: K) => R) =>
    func;
