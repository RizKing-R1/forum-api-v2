import routes from './routes.js';
import LikesHandler from './handler.js';

export default (container) => {
  const likesHandler = new LikesHandler(container);
  return routes(likesHandler);
};
