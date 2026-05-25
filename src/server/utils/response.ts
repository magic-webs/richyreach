import { Context } from "hono";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    pagination?: {
      total?: number;
      limit?: number;
      offset?: number;
      nextCursor?: string | null;
      hasMore?: boolean;
    };
    [key: string]: any;
  };
}

export function sendSuccess<T = any>(
  c: Context,
  data: T,
  message?: string,
  statusCode = 200,
  meta?: Record<string, any>
) {
  const responseBody: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta,
  };
  return c.json(responseBody, statusCode as any);
}

export function sendError(
  c: Context,
  message: string,
  statusCode = 400,
  details?: any
) {
  const responseBody: ApiResponse = {
    success: false,
    error: message,
    meta: details ? { details } : undefined,
  };
  return c.json(responseBody, statusCode as any);
}

export function sendPaginated<T = any[]>(
  c: Context,
  data: T,
  pagination: {
    total?: number;
    limit: number;
    offset?: number;
    nextCursor?: string | null;
    hasMore?: boolean;
  },
  message?: string
) {
  return sendSuccess(c, data, message, 200, {
    pagination: {
      total: pagination.total,
      limit: pagination.limit,
      offset: pagination.offset,
      nextCursor: pagination.nextCursor,
      hasMore: pagination.hasMore ?? (pagination.nextCursor ? true : false),
    },
  });
}
