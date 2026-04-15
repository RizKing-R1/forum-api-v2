import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';
import GetThreadUseCase from '../../../../Applications/use_case/GetThreadUseCase.js';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';
import jwt from 'jsonwebtoken';

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
  }

  async postThreadHandler(req, res, next) {
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

      const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
      const useCasePayload = {
        title: req.body.title,
        body: req.body.body,
        owner,
      };

      const addedThread = await addThreadUseCase.execute(useCasePayload);

      res.status(201).json({
        status: 'success',
        data: {
          addedThread,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getThreadByIdHandler(req, res, next) {
    try {
      const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
      const useCasePayload = {
        threadId: req.params.threadId,
      };

      const thread = await getThreadUseCase.execute(useCasePayload);

      res.status(200).json({
        status: 'success',
        data: {
          thread,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ThreadsHandler;