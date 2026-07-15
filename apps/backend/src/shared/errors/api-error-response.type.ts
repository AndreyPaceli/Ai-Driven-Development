export type ApiErrorResponse = {
  statusCode: number;
  error: string;
  message: string[];
  details?: unknown[];
  path?: string;
  timestamp: string;
};
