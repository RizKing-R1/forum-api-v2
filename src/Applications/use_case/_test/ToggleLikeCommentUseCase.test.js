import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import LikeRepository from '../../../Domains/likes/LikeRepository.js';
import ToggleLikeCommentUseCase from '../ToggleLikeCommentUseCase.js';

describe('ToggleLikeCommentUseCase', () => {
  it('should orchestrate the add like action correctly when not liked before', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkLikeExists = vi.fn().mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = vi.fn().mockImplementation(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await toggleLikeCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.checkLikeExists).toHaveBeenCalledWith(useCasePayload.userId, useCasePayload.commentId);
    expect(mockLikeRepository.addLike).toHaveBeenCalledWith(useCasePayload.userId, useCasePayload.commentId);
  });

  it('should orchestrate the delete like action correctly when liked before', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExists = vi.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn().mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkLikeExists = vi.fn().mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.deleteLike = vi.fn().mockImplementation(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    await toggleLikeCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockLikeRepository.checkLikeExists).toHaveBeenCalledWith(useCasePayload.userId, useCasePayload.commentId);
    expect(mockLikeRepository.deleteLike).toHaveBeenCalledWith(useCasePayload.userId, useCasePayload.commentId);
  });
});
