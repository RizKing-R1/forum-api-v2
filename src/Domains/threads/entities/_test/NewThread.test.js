import NewThread from '../NewThread.js';

describe('a NewThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'dicoding',
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 123,
      body: true,
      owner: 'user-123',
    };

    expect(() => new NewThread(payload)).toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newThread object correctly', () => {
    const payload = {
      title: 'dicoding',
      body: 'secret',
      owner: 'user-123',
    };

    const newThread = new NewThread(payload);

    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
    expect(newThread.owner).toEqual(payload.owner);
  });
});