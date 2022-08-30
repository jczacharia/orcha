/**
 * An Operation's error response schema.
 */
export interface ServerOperationError {
  statusCode: number;
  /** ISO string. */
  timestamp: string;
  operation: string;
  message: string;
  response: string | object;
}
