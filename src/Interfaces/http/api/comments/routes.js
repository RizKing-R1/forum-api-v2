import { Router } from 'express';
import CommentsHandler from './handler.js';

const routes = (container) => {
  const handler = new CommentsHandler(container);
  const router = Router({ mergeParams: true });

  router.post('/', handler.postCommentHandler);
  router.delete('/:commentId', handler.deleteCommentHandler.bind(handler));

  return router;
};

export default routes;
