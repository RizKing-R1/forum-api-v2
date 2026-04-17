import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import AuthenticationsTableTestHelper from '../../../../tests/AuthenticationsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import request from 'supertest';

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  beforeAll(async () => {
    await LikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and add like to comment', async () => {
      const server = await createServer(container);

      await request(server).post('/users').send({ username: 'dicoding', password: 'password', fullname: 'Dicoding' });
      const authResponse = await request(server).post('/authentications').send({ username: 'dicoding', password: 'password' });
      const accessToken = authResponse.body.data.accessToken;

      const threadResponse = await request(server).post('/threads').set('Authorization', `Bearer ${accessToken}`).send({ title: 'T', body: 'B' });
      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(server).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessToken}`).send({ content: 'C' });
      const commentId = commentResponse.body.data.addedComment.id;

      const response = await request(server).put(`/threads/${threadId}/comments/${commentId}/likes`).set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');

      const likesResult = await pool.query('SELECT * FROM user_comment_likes');
      expect(likesResult.rowCount).toEqual(1);
    });

    it('should response 200 and remove like from comment if already liked', async () => {
      const server = await createServer(container);

      await request(server).post('/users').send({ username: 'dicoding', password: 'password', fullname: 'Dicoding' });
      const authResponse = await request(server).post('/authentications').send({ username: 'dicoding', password: 'password' });
      const accessToken = authResponse.body.data.accessToken;

      const threadResponse = await request(server).post('/threads').set('Authorization', `Bearer ${accessToken}`).send({ title: 'T', body: 'B' });
      const threadId = threadResponse.body.data.addedThread.id;

      const commentResponse = await request(server).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessToken}`).send({ content: 'C' });
      const commentId = commentResponse.body.data.addedComment.id;

      await request(server).put(`/threads/${threadId}/comments/${commentId}/likes`).set('Authorization', `Bearer ${accessToken}`);

      const response = await request(server).put(`/threads/${threadId}/comments/${commentId}/likes`).set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');

      const likesResult = await pool.query('SELECT * FROM user_comment_likes');
      expect(likesResult.rowCount).toEqual(0);
    });

    it('should response 404 when thread does not exist', async () => {
      const server = await createServer(container);

      await request(server).post('/users').send({ username: 'dicoding', password: 'password', fullname: 'Dicoding' });
      const authResponse = await request(server).post('/authentications').send({ username: 'dicoding', password: 'password' });
      const accessToken = authResponse.body.data.accessToken;

      const response = await request(server).put('/threads/thread-xxx/comments/comment-xxx/likes').set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 404 when comment does not exist', async () => {
      const server = await createServer(container);

      await request(server).post('/users').send({ username: 'dicoding', password: 'password', fullname: 'Dicoding' });
      const authResponse = await request(server).post('/authentications').send({ username: 'dicoding', password: 'password' });
      const accessToken = authResponse.body.data.accessToken;

      const threadResponse = await request(server).post('/threads').set('Authorization', `Bearer ${accessToken}`).send({ title: 'T', body: 'B' });
      const threadId = threadResponse.body.data.addedThread.id;

      const response = await request(server).put(`/threads/${threadId}/comments/comment-xxx/likes`).set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 401 when no authentication provided', async () => {
      const server = await createServer(container);
      const response = await request(server).put('/threads/thread-123/comments/comment-123/likes');
      expect(response.status).toEqual(401);
    });

    it('should response 401 when authentication token is invalid', async () => {
      const server = await createServer(container);
      const response = await request(server)
        .put('/threads/thread-123/comments/comment-123/likes')
        .set('Authorization', 'Bearer invalid_token');
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });
  });
});
