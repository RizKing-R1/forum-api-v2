import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';
import pool from '../../database/postgres/pool.js';
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should add like to database', async () => {
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await likeRepositoryPostgres.addLike('user-123', 'comment-123');

      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(1);
      expect(likes[0].user_id).toBe('user-123');
      expect(likes[0].comment_id).toBe('comment-123');
    });
  });

  describe('deleteLike function', () => {
    it('should delete like from database', async () => {
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => '123');

      await likeRepositoryPostgres.deleteLike('user-123', 'comment-123');

      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('checkLikeExists function', () => {
    it('should return true if like exists', async () => {
      await LikesTableTestHelper.addLike({ id: 'like-123', userId: 'user-123', commentId: 'comment-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => '123');

      const isLiked = await likeRepositoryPostgres.checkLikeExists('user-123', 'comment-123');

      expect(isLiked).toBe(true);
    });

    it('should return false if like does not exist', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => '123');

      const isLiked = await likeRepositoryPostgres.checkLikeExists('user-123', 'comment-123');

      expect(isLiked).toBe(false);
    });
  });
});
