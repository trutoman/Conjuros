import type { RequestHandler } from 'express';
import { itemIdSchema } from '@conjuros/contracts';
import type { TagCategoriesService } from '../services/tag-categories.service';

function userId(request: Parameters<RequestHandler>[0]): string {
  const currentUser = (request as Parameters<RequestHandler>[0] & { currentUser?: { id: string; email: string } }).currentUser;
  if (!currentUser) throw new Error('Authenticated route is missing a user');
  return currentUser.id;
}

function categoryId(request: Parameters<RequestHandler>[0]): string {
  return itemIdSchema.parse(request.params.id);
}

export function createTagCategoriesController(service: TagCategoriesService): Record<string, RequestHandler> {
  return {
    list: (request, response, next) => {
      void service.list(userId(request), service.parseQuery(request.query)).then((result) => response.json(result)).catch(next);
    },
    get: (request, response, next) => {
      void service.get(userId(request), categoryId(request)).then((category) => response.json(category)).catch(next);
    },
    create: (request, response, next) => {
      void service.create(userId(request), service.parseCreate(request.body)).then((category) => response.status(201).json(category)).catch(next);
    },
    update: (request, response, next) => {
      void service.update(userId(request), categoryId(request), service.parseUpdate(request.body)).then((category) => response.json(category)).catch(next);
    },
    delete: (request, response, next) => {
      void service.delete(userId(request), categoryId(request)).then(() => response.status(204).end()).catch(next);
    },
    reorder: (request, response, next) => {
      void service.reorder(userId(request), categoryId(request), service.parseReorder(request.body)).then((category) => response.json(category)).catch(next);
    },
  };
}
