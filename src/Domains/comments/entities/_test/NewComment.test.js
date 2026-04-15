/* eslint-disable camelcase */
import NewComment from '../NewComment.js';

describe('a NewComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'sebuah komentar',
    };

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 123,
      thread_id: 'thread-123',
      owner: 'user-123',
    };

    expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newComment object correctly', () => {
    const payload = {
      content: 'sebuah komentar',
      thread_id: 'thread-123',
      owner: 'user-123',
    };

    const newComment = new NewComment(payload);

    expect(newComment.content).toEqual(payload.content);
    expect(newComment.thread_id).toEqual(payload.thread_id);
    expect(newComment.owner).toEqual(payload.owner);
  });
});
