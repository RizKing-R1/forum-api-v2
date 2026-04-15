import { Router } from 'express';
import RepliesHandler from './handler.js';

const routes = (container) => {
  const handler = new RepliesHandler(container);
  const router = Router({ mergeParams: true });

  router.post('/', handler.postReplyHandler);
  router.delete('/:replyId', handler.deleteReplyHandler);

  return router;
};

export default routes;
