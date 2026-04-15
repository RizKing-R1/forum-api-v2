import NewReply from '../NewReply.js';

describe('a NewReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'abc',
    };

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 123,
      commentId: 'comment-123',
      owner: 'user-123',
    };

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newReply object correctly', () => {
    const payload = {
      content: 'sebuah balasan',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const newReply = new NewReply(payload);

    expect(newReply.content).toEqual(payload.content);
    expect(newReply.comment_id).toEqual(payload.commentId);
    expect(newReply.owner).toEqual(payload.owner);
  });
});
