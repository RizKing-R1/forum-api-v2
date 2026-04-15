import AddReplyUseCase from '../../../../Applications/use_case/AddReplyUseCase.js';
import DeleteReplyUseCase from '../../../../Applications/use_case/DeleteReplyUseCase.js';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';
import jwt from 'jsonwebtoken';

class RepliesHandler {
  constructor(container) {
    this._container = container;
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(req, res, next) {
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

      const { id: owner } = decodedPayload;
      const { threadId, commentId } = req.params;

      const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
      const useCasePayload = {
        content: req.body.content,
        threadId,
        commentId,
        owner,
      };

      const addedReply = await addReplyUseCase.execute(useCasePayload);

      res.status(201).json({
        status: 'success',
        data: {
          addedReply,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReplyHandler(req, res, next) {
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

      const { id: owner } = decodedPayload;
      const { threadId, commentId, replyId } = req.params;

      const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
      const useCasePayload = {
        threadId,
        commentId,
        replyId,
        owner,
      };

      await deleteReplyUseCase.execute(useCasePayload);

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RepliesHandler;
