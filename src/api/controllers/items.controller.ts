import type { RequestHandler } from 'express';
import { collectionQuerySchema, itemIdSchema, reorderItemSchema } from '@conjuros/contracts';
import type { ItemsService } from '../services/items.service';
import { parseOrThrow } from '../utils/http';

function userId(request: Parameters<RequestHandler>[0]): string {
  const currentUser = (request as Parameters<RequestHandler>[0] & { currentUser?: { id: string; email: string } }).currentUser;
  if (!currentUser) throw new Error('Authenticated route is missing a user');
  return currentUser.id;
}

function itemId(request: Parameters<RequestHandler>[0]): string {
  return itemIdSchema.parse(request.params.id);
}

export function createItemsController(service: ItemsService): Record<string, RequestHandler> {
  return {
    list: (request, response, next) => { void service.list(userId(request), collectionQuerySchema.parse(request.query)).then((result) => response.json(result)).catch(next); },
    get: (request, response, next) => { void service.get(userId(request), itemId(request)).then((item) => response.json(item)).catch(next); },
    create: (request, response, next) => { void service.create(userId(request), service.parseCreate(request.body)).then((item) => response.status(201).json(item)).catch(next); },
    update: (request, response, next) => { void service.update(userId(request), itemId(request), service.parseUpdate(request.body)).then((item) => response.json(item)).catch(next); },
    delete: (request, response, next) => { void service.delete(userId(request), itemId(request)).then(() => response.status(204).end()).catch(next); },
    reorder: (request, response, next) => { void service.reorder(userId(request), itemId(request), parseOrThrow(reorderItemSchema, request.body).order).then((item) => response.json(item)).catch(next); },
  };
}