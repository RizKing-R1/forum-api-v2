class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, replyId, owner } = useCasePayload;

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);
    await this._replyRepository.verifyReplyExists(replyId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);

    await this._replyRepository.deleteReply(replyId);
  }
}

export default DeleteReplyUseCase;
