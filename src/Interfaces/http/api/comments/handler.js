import AddCommentUseCase from '../../../../Applications/use_case/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/DeleteCommentUseCase.js';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';
import jwt from 'jsonwebtoken';

class CommentsHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postCommentHandler(req, res, next) {
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
      const { threadId } = req.params;

      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      const useCasePayload = {
        content: req.body.content,
        threadId,
        owner,
      };

      const addedComment = await addCommentUseCase.execute(useCasePayload);

      res.status(201).json({
        status: 'success',
        data: {
          addedComment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentHandler(req, res, next) {
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

      const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
      const useCasePayload = {
        threadId,
        commentId,
        owner,
      };

      await deleteCommentUseCase.execute(useCasePayload);

      res.status(200).json({
        status: 'success',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CommentsHandler;
