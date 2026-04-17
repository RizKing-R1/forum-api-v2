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

describe('/threads/{threadId}/comments endpoint', () => {
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

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      const server = await createServer(container);

      await request(server).post('/users').send({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const authResponse = await request(server).post('/authentications').send({
        username: 'dicoding',
        password: 'secret_password',
      });

      const { accessToken } = authResponse.body.data;

      const threadResponse = await request(server)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'dicoding', body: 'secret' });

      const { id: threadId } = threadResponse.body.data.addedThread;

      const response = await request(server)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toBeDefined();
      expect(response.body.data.addedComment.content).toEqual('sebuah komentar');
    });

    it('should response 404 when thread does not exist', async () => {
      const server = await createServer(container);

      await request(server).post('/users').send({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const authResponse = await request(server).post('/authentications').send({
        username: 'dicoding',
        password: 'secret_password',
      });

      const { accessToken } = authResponse.body.data;

      const response = await request(server)
        .post('/threads/thread-xxx/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 401 when no authentication provided', async () => {
      const server = await createServer(container);

      const response = await request(server)
        .post('/threads/thread-123/comments')
        .send({ content: 'sebuah komentar' });

      expect(response.status).toEqual(401);
    });

    it('should response 401 when authentication token is invalid', async () => {
      const server = await createServer(container);

      const response = await request(server)
        .post('/threads/thread-123/comments')
        .set('Authorization', 'Bearer invalid_token')
        .send({ content: 'sebuah komentar' });

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should delete comment and return 200', async () => {
      const server = await createServer(container);

      await request(server).post('/users').send({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding',
      });
      const authObj = await request(server).post('/authentications').send({
        username: 'dicoding',
        password: 'secret_password',
      });
      const { accessToken } = authObj.body.data;

      const threadRes = await request(server).post('/threads').set('Authorization', `Bearer ${accessToken}`).send({ title: 'A', body: 'B' });
      const threadId = threadRes.body.data.addedThread.id;

      const commentRes = await request(server).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${accessToken}`).send({ content: 'komentar' });
      const commentId = commentRes.body.data.addedComment.id;

      const deleteRes = await request(server).delete(`/threads/${threadId}/comments/${commentId}`).set('Authorization', `Bearer ${accessToken}`);

      expect(deleteRes.status).toEqual(200);
      expect(deleteRes.body.status).toEqual('success');

      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments[0].isDelete).toEqual(true);
    });

    it('should response 403 when trying to delete comment that is not theirs', async () => {
      const server = await createServer(container);

      await request(server).post('/users').send({ username: 'owner', password: 'password', fullname: 'Owner' });
      const ownerAuth = await request(server).post('/authentications').send({ username: 'owner', password: 'password' });
      const ownerToken = ownerAuth.body.data.accessToken;

      await request(server).post('/users').send({ username: 'other', password: 'password', fullname: 'Other' });
      const otherAuth = await request(server).post('/authentications').send({ username: 'other', password: 'password' });
      const otherToken = otherAuth.body.data.accessToken;

      const threadRes = await request(server).post('/threads').set('Authorization', `Bearer ${ownerToken}`).send({ title: 'A', body: 'B' });
      const threadId = threadRes.body.data.addedThread.id;

      const commentRes = await request(server).post(`/threads/${threadId}/comments`).set('Authorization', `Bearer ${ownerToken}`).send({ content: 'komentar' });
      const commentId = commentRes.body.data.addedComment.id;

      const deleteRes = await request(server).delete(`/threads/${threadId}/comments/${commentId}`).set('Authorization', `Bearer ${otherToken}`);

      expect(deleteRes.status).toEqual(403);
    });

    it('should response 404 when thread does not exist for delete comment', async () => {
      const server = await createServer(container);

      await request(server).post('/users').send({ username: 'dicoding', password: 'password', fullname: 'User' });
      const authObj = await request(server).post('/authentications').send({ username: 'dicoding', password: 'password' });
      const accessToken = authObj.body.data.accessToken;

      const deleteRes = await request(server).delete('/threads/thread-xxx/comments/comment-xxx').set('Authorization', `Bearer ${accessToken}`);

      expect(deleteRes.status).toEqual(404);
    });

    it('should response 404 when comment does not exist for delete', async () => {
      const server = await createServer(container);

      await request(server).post('/users').send({ username: 'dicoding', password: 'password', fullname: 'User' });
      const authObj = await request(server).post('/authentications').send({ username: 'dicoding', password: 'password' });
      const accessToken = authObj.body.data.accessToken;

      const threadRes = await request(server).post('/threads').set('Authorization', `Bearer ${accessToken}`).send({ title: 'A', body: 'B' });
      const threadId = threadRes.body.data.addedThread.id;

      const deleteRes = await request(server).delete(`/threads/${threadId}/comments/comment-xxx`).set('Authorization', `Bearer ${accessToken}`);

      expect(deleteRes.status).toEqual(404);
    });

    it('should response 401 when no authentication provided for delete comment', async () => {
      const server = await createServer(container);

      const response = await request(server)
        .delete('/threads/thread-123/comments/comment-123');

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 401 when authentication token is invalid for delete comment', async () => {
      const server = await createServer(container);

      const response = await request(server)
        .delete('/threads/thread-123/comments/comment-123')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });
  });
});
