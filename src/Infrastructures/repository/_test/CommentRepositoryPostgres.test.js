/* eslint-disable camelcase */
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      const newComment = new NewComment({
        content: 'sebuah komentar',
        thread_id: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(newComment);

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      const newComment = new NewComment({
        content: 'sebuah komentar',
        thread_id: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyCommentExists function', () => {
    it('should throw NotFoundError when comment does not exist', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentExists('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentExists('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError when comment does not exist', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner is not the same', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-321')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw any error when owner is the same', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrowError();
    });
  });

  describe('deleteComment function', () => {
    it('should soft delete comment correctly by changing is_delete to true', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', thread_id: 'thread-123', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.deleteComment('comment-123');

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments correctly', async () => {
      const date1 = new Date('2021-08-08T07:19:09.775Z').toISOString();
      const date2 = new Date('2021-08-08T07:20:00.000Z').toISOString();
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123', date: date1, content: 'komentar 1' });
      await CommentsTableTestHelper.addComment({ id: 'comment-345', threadId: 'thread-123', owner: 'user-123', date: date2, content: 'komentar 2' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].content).toEqual('komentar 1');
      expect(comments[0].date).toEqual(date1);
      expect(comments[0].is_delete).toEqual(false);
      expect(comments[0].like_count).toEqual(0);

      expect(comments[1].id).toEqual('comment-345');
      expect(comments[1].username).toEqual('dicoding');
      expect(comments[1].content).toEqual('komentar 2');
      expect(comments[1].date).toEqual(date2);
      expect(comments[1].is_delete).toEqual(false);
      expect(comments[1].like_count).toEqual(0);
    });

    it('should return like_count correctly when comment is liked', async () => {
      const date1 = new Date('2021-08-08T07:19:09.775Z').toISOString();
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123', date: date1, content: 'komentar 1' });

      const { default: LikesTableTestHelper } = await import('../../../../tests/LikesTableTestHelper.js');
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].like_count).toEqual(1);
    });
  });
});
