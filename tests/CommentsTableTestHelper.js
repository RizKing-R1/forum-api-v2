/* eslint-disable camelcase */
/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', thread_id = 'thread-123', content = 'sebuah komentar', owner = 'user-123', is_delete = false, date = '2021-08-08T07:19:09.775Z',
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, thread_id, content, owner, is_delete, date],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE comments CASCADE');
  },
};

export default CommentsTableTestHelper;
