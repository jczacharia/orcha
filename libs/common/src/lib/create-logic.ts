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
 * export const calculateVoucherStatus = createLogic<Voucher>()({ dateRedeemed: true, dateRefunded: true })(
 *   (voucher) => {
 *     if (voucher.dateRedeemed) return 'redeemed';
 *     if (voucher.dateRefunded) return 'refunded';
 *     return 'active';
 *   }
 * );
 * const voucherStatus = calculateVoucherStatus(voucher);
 * ```
 *
 * You can also insert extra parameters for robust calculations.
 * @example
 * ```typescript
 * const compareVoucherCode = createLogic<Voucher>()({ code: true })(
 *   (voucher, compare: number) => voucher.code === compare
 * );
 * const isVoucher999 = compareVoucherCode(voucher, 999);
 * ```
 *
 * You can also compare two entities using currying.
 * @example
 * ```typescript
 * export const compareTwoTodos = createLogic<Todo>()({ content: true })(
 *   (todo) => (compare: typeof todo) => todo.content === compare.content
 * );
 * const todosHaveTheSameContent = compareTwoTodos(todo1)(todo2);
 * ```
 *
 * @returns The function defined in the third curried function argument.
 */
export const createLogic =
  <T>() =>
  <Q extends IQuery<T>>(query: IExactQuery<T, Q>) =>
  <R, K extends unknown[]>(func: (model: IParser<T, typeof query>, ...a: K) => R) =>
    func;
