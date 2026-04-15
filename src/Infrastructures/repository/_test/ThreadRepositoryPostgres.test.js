import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NewThread from '../../../Domains/threads/entities/NewThread.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'dicoding321' });
      const newThread = new NewThread({
        title: 'dicoding',
        body: 'secret',
        owner: 'user-321',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread(newThread);

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'dicoding321' });
      const newThread = new NewThread({
        title: 'dicoding',
        body: 'secret',
        owner: 'user-321',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'dicoding',
        owner: 'user-321',
      }));
    });
  });

  describe('verifyThreadExists function', () => {
    it('should not throw error when thread exists', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'dicoding321' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-321' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
        .resolves.not.toThrowError();
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.verifyThreadExists('thread-xxx'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread does not exist', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.getThreadById('thread-xxx')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread correctly', async () => {
      const date = new Date().toISOString();
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'A title', body: 'A body', owner: 'user-123', date });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('A title');
      expect(thread.body).toEqual('A body');
      expect(thread.date).toEqual(date);
      expect(thread.username).toEqual('dicoding');
    });
  });
});
