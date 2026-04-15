import { vi } from 'vitest';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadExists = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyExists = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = vi.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = vi.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteReplyUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.verifyReplyExists).toBeCalledWith(useCasePayload.replyId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(useCasePayload.replyId, useCasePayload.owner);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(useCasePayload.replyId);
  });
});
