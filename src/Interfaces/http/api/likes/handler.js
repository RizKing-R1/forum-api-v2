import ToggleLikeCommentUseCase from '../../../../Applications/use_case/ToggleLikeCommentUseCase.js';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';
import jwt from 'jsonwebtoken';

class LikesHandler {
  constructor(container) {
    this._container = container;
    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing authentication');
      }

      const token = authHeader.split(' ')[1];
      let decodedPayload;
      try {
        decodedPayload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
      } catch {
        throw new AuthenticationError('Invalid authentication token');
      }

      const { id: userId } = decodedPayload;
      const { threadId, commentId } = req.params;

      const toggleLikeCommentUseCase = this._container.getInstance(ToggleLikeCommentUseCase.name);
      await toggleLikeCommentUseCase.execute({ threadId, commentId, userId });

      return res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default LikesHandler;
