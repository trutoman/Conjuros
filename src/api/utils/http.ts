import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../errors';

export function parseOrThrow<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid request data', result.error.issues);
  }
  return result.data;
}

export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (request, response, next) => {
    void Promise.resolve(handler(request, response, next)).catch(next);
  };
}