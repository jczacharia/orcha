import { ORCHA_LIMIT, ORCHA_OFFSET, ORCHA_PAGINATE } from './constants';

/**
 * Describes the response schema for a pagination-based Operation.
 */
export interface IPagination<E> {
  items: E[];
  count: number;
}

/**
 * Required fields for pagination information.
 */
export interface IPaginate {
  [ORCHA_PAGINATE]: {
    /**
     * Starts at 0.
     */
    [ORCHA_OFFSET]: number;
    [ORCHA_LIMIT]: number;
  };
}
