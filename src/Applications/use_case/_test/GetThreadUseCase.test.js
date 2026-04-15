/* eslint-disable camelcase */
import { vi } from 'vitest';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import CommentRepository from '../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../Domains/replies/ReplyRepository.js';
import GetThreadUseCase from '../GetThreadUseCase.js';

describe('GetThreadUseCase', () => {
  it('should orchestrate the get thread action correctly with replies', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-1',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah komentar',
        is_delete: false,
        like_count: 2,
      },
      {
        id: 'comment-2',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'komentar ini akan dihapus',
        is_delete: true,
        like_count: 0,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-1',
        comment_id: 'comment-1',
        content: 'sebuah balasan',
        date: '2021-08-08T07:23:33.555Z',
        username: 'dicoding',
        is_delete: false,
      },
      {
        id: 'reply-2',
        comment_id: 'comment-1',
        content: 'balasan dihapus',
        date: '2021-08-08T07:24:33.555Z',
        username: 'johndoe',
        is_delete: true,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.getThreadById = vi.fn()
      .mockImplementation(() => Promise.resolve(mockThread));

    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.getCommentsByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve(mockComments));

    const mockReplyRepository = new ReplyRepository();
    mockReplyRepository.getRepliesByThreadId = vi.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const thread = await getThreadUseCase.execute(useCasePayload);

    expect(thread).toStrictEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah komentar',
          likeCount: 2,
          replies: [
            {
              id: 'reply-1',
              content: 'sebuah balasan',
              date: '2021-08-08T07:23:33.555Z',
              username: 'dicoding',
            },
            {
              id: 'reply-2',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T07:24:33.555Z',
              username: 'johndoe',
            },
          ],
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [],
        },
      ],
    });

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCasePayload.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCasePayload.threadId);
  });
});
