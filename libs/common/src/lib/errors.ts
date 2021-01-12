export interface OrchestraOperationError {
  statusCode: number;
  /** ISO string. */
  timestamp: string;
  operation: string;
  message: string;
}
