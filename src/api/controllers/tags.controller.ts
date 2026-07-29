import type { RequestHandler } from 'express';
import { itemIdSchema } from '@conjuros/contracts';
import type { TagsService } from '../services/tags.service';

function userId(request: Parameters<RequestHandler>[0]): string {
  const currentUser = (request as Parameters<RequestHandler>[0] & { currentUser?: { id: string; email: string } }).currentUser;
  if (!currentUser) throw new Error('Authenticated route is missing a user');
  return currentUser.id;
}

function tagId(request: Parameters<RequestHandler>[0]): string {
  return itemIdSchema.parse(request.params.id);
}

export function createTagsController(service: TagsService): Record<string, RequestHandler> {
  return {
    list: (request, response, next) => {
      void service.list(userId(request), service.parseQuery(request.query)).then((result) => response.json(result)).catch(next);
    },
    get: (request, response, next) => {
      void service.get(userId(request), tagId(request)).then((tag) => response.json(tag)).catch(next);
    },
    create: (request, response, next) => {
      void service.create(userId(request), service.parseCreate(request.body)).then((tag) => response.status(201).json(tag)).catch(next);
    },
    update: (request, response, next) => {
      void service.update(userId(request), tagId(request), service.parseUpdate(request.body)).then((tag) => response.json(tag)).catch(next);
    },
    delete: (request, response, next) => {
      void service.delete(userId(request), tagId(request)).then(() => response.status(204).end()).catch(next);
    },
    reorder: (request, response, next) => {
      void service.reorder(userId(request), tagId(request), service.parseReorder(request.body)).then((tag) => response.json(tag)).catch(next);
    },
  };
}
