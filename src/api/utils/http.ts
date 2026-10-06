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

export function parseCredentialsOrThrow<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid request data';
    throw new AppError(400, 'VALIDATION_ERROR', message, result.error.issues);
  }
  return result.data;
}

export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (request, response, next) => {
    void Promise.resolve(handler(request, response, next)).catch(next);
  };
}