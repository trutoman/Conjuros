import type { RequestHandler } from 'express';
import type { ThemesService } from '../services/themes.service';

function currentUser(request: Parameters<RequestHandler>[0]): { id: string; email: string } {
  const user = (request as Parameters<RequestHandler>[0] & { currentUser?: { id: string; email: string } }).currentUser;
  if (!user) throw new Error('Authenticated route is missing a user');
  return user;
}

export function createThemesController(service: ThemesService): Record<string, RequestHandler> {
  return {
    list: (request, response, next) => {
      void service.list(service.parseQuery(request.query)).then((result) => response.json(result)).catch(next);
    },
    get: (request, response, next) => {
      void service.get(service.parseId(request.params.id)).then((theme) => response.json(theme)).catch(next);
    },
    getActive: (request, response, next) => {
      void service.getActiveForUser(currentUser(request).id).then((context) => response.json(context)).catch(next);
    },
    create: (request, response, next) => {
      void service.create(service.parseInput(request.body)).then((theme) => response.status(201).json(theme)).catch(next);
    },
    update: (request, response, next) => {
      void service.update(service.parseId(request.params.id), service.parseUpdate(request.body)).then((theme) => response.json(theme)).catch(next);
    },
    delete: (request, response, next) => {
      void service.delete(service.parseId(request.params.id)).then(() => response.status(204).end()).catch(next);
    },
    activate: (request, response, next) => {
      void service.setActive(service.parseId(request.params.id)).then((theme) => response.json(theme)).catch(next);
    },
  };
}