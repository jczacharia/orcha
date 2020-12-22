export interface KirtanOperationError {
  statusCode: number;
  /** ISO string. */
  timestamp: string;
  operation: string;
  message: string;
}
