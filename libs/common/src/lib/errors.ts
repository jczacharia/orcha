/**
 * An Operation's error response schema.
 */
export interface OrchaOperationError {
  statusCode: number;
  /** ISO string. */
  timestamp: string;
  operation: string;
  message: string;
  response: string | object;
}
