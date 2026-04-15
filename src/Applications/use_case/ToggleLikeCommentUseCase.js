class ToggleLikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const isLiked = await this._likeRepository.checkLikeExists(userId, commentId);

    if (isLiked) {
      await this._likeRepository.deleteLike(userId, commentId);
    } else {
      await this._likeRepository.addLike(userId, commentId);
    }
  }
}

export default ToggleLikeCommentUseCase;
