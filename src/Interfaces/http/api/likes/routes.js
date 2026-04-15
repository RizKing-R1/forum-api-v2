import express from 'express';

const routes = (handler) => {
  const router = express.Router({ mergeParams: true });

  router.put('/', handler.putLikeHandler);

  return router;
};

export default routes;
