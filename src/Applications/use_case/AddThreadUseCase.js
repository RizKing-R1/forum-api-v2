import NewThread from '../../Domains/threads/entities/NewThread.js';
import AddedThread from '../../Domains/threads/entities/AddedThread.js';

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newThread = new NewThread(useCasePayload);
    const addedThread = await this._threadRepository.addThread(newThread);
    return new AddedThread(addedThread);
  }
}

export default AddThreadUseCase;