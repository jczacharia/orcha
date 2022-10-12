/**
 * Describes the response schema for a pagination-based Operation.
 */
export type IPagination<E, Extra extends Record<string, any> = object> = Extra & {
  items: E[];
  count: number;
};

/**
 * Required fields for pagination information.
 */
export interface IPaginateQuery {
  /**
   * Starts at 0.
   */
  offset: number;
  limit: number;
}
