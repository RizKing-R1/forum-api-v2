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
import jwt from 'jsonwebtoken';

describe('/threads endpoint', () => {
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

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      const requestPayload = {
        title: 'dicoding',
        body: 'secret',
      };
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
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(requestPayload);

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual(requestPayload.title);
    });

    it('should response 401 when no authentication provided', async () => {
      const server = await createServer(container);

      const response = await request(server)
        .post('/threads')
        .send({ title: 'dicoding', body: 'secret' });

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 401 when authentication token is invalid', async () => {
      const server = await createServer(container);

      const response = await request(server)
        .post('/threads')
        .set('Authorization', 'Bearer invalid_token')
        .send({ title: 'dicoding', body: 'secret' });

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 500 when server encounters unexpected error', async () => {
      const fakeContainer = {
        getInstance: () => ({
          execute: () => { throw new Error('server error'); },
        }),
      };
      const server = await createServer(fakeContainer);
      const token = jwt.sign({ id: 'user-123' }, process.env.ACCESS_TOKEN_KEY);

      const response = await request(server)
        .post('/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'dicoding', body: 'secret' });

      expect(response.status).toEqual(500);
      expect(response.body.status).toEqual('error');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail correctly', async () => {
      const server = await createServer(container);

      await request(server).post('/users').send({ username: 'dicoding', password: 'secret_password', fullname: 'Dicoding Indonesia' });
      const authResponse = await request(server).post('/authentications').send({ username: 'dicoding', password: 'secret_password' });
      const { accessToken } = authResponse.body.data;

      const threadResponse = await request(server)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'dicoding', body: 'secret' });

      const threadId = threadResponse.body.data.addedThread.id;

      const commentRes1 = await request(server)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar pertama' });
      const commentId1 = commentRes1.body.data.addedComment.id;

      const commentRes2 = await request(server)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar kedua' });
      const deletedCommentId = commentRes2.body.data.addedComment.id;
      await request(server)
        .delete(`/threads/${threadId}/comments/${deletedCommentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      await request(server)
        .post(`/threads/${threadId}/comments/${commentId1}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'balasan biasa' });

      const replyRes2 = await request(server)
        .post(`/threads/${threadId}/comments/${commentId1}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'balasan dihapus' });
      const deletedReplyId = replyRes2.body.data.addedReply.id;
      await request(server)
        .delete(`/threads/${threadId}/comments/${commentId1}/replies/${deletedReplyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      const response = await request(server).get(`/threads/${threadId}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.thread).toBeDefined();
      expect(response.body.data.thread.id).toEqual(threadId);
      expect(response.body.data.thread.title).toEqual('dicoding');
      expect(response.body.data.thread.body).toEqual('secret');
      expect(response.body.data.thread.username).toEqual('dicoding');
      expect(response.body.data.thread.comments).toHaveLength(2);
      expect(response.body.data.thread.comments[0].content).toEqual('komentar pertama');
      expect(response.body.data.thread.comments[1].content).toEqual('**komentar telah dihapus**');
      expect(response.body.data.thread.comments[0].is_delete).toBeUndefined();

      expect(response.body.data.thread.comments[0].replies).toHaveLength(2);
      expect(response.body.data.thread.comments[0].replies[0].content).toEqual('balasan biasa');
      expect(response.body.data.thread.comments[0].replies[1].content).toEqual('**balasan telah dihapus**');
      expect(response.body.data.thread.comments[0].replies[0].is_delete).toBeUndefined();
      expect(response.body.data.thread.comments[0].replies[0].comment_id).toBeUndefined();
      expect(response.body.data.thread.comments[1].replies).toHaveLength(0);
    });

    it('should response 404 when thread does not exist', async () => {
      const server = await createServer(container);
      const response = await request(server).get('/threads/thread-xxx');

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });
  });
});