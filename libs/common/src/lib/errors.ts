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

/**
 * An Subscriptions's error response schema.
 */
export interface OrchaSubscriptionError {
  /** ISO string. */
  timestamp: string;
  channel: string;
  message: string;
}

/**
 * Creates an error channel name for a subscription channel.
 */
export const subscriptionChannelErrorRoute = (channel: string) => `${channel}:__error__`;
