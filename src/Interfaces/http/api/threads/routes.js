import { Router } from 'express';
import ThreadsHandler from './handler.js';

const routes = (container) => {
  const handler = new ThreadsHandler(container);
  const router = Router();

  router.post('/', handler.postThreadHandler);
  router.get('/:threadId', handler.getThreadByIdHandler);

  return router;
};

export default routes;