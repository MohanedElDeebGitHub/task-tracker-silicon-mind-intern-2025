const { pool } = require("../config/db.js");

async function create({ title, description, status, user_id }) {
  const query = `
    INSERT INTO tasks (title, description, status, user_id) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *`;

  const values = [title, description, status || "to-do", user_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function findAllByUserId(user_id) {
  const query =
    "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC";
  const { rows } = await pool.query(query, [user_id]);
  return rows;
}

async function findById(id) {
  const query = "SELECT * FROM tasks WHERE id = $1";
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

async function update(id, { title, description, status, total_duration }) {
  const query = `
    UPDATE tasks 
    SET title = $1, description = $2, status = $3, total_duration = $4 
    WHERE id = $5 
    RETURNING *`;
  const values = [title, description, status, total_duration, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function remove(id) {
  const query = "DELETE FROM tasks WHERE id = $1 RETURNING *";
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

module.exports = {
  create,
  findAllByUserId,
  findById,
  update,
  remove,
};
