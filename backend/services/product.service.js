import { pool } from "../config/db.js";
import {
  encodeCursor,
  decodeCursor,
} from "../utils/cursor.js";

export async function fetchProducts({
  limit,
  category,
  cursor,
}) {
  let query = `
      SELECT *
      FROM products
  `;

  const values = [];
  const conditions = [];

  // category filter

  if (category) {
    values.push(category);

    conditions.push(
      `category = $${values.length}`
    );
  }

  // cursor filter

  if (cursor) {
    const decoded = decodeCursor(cursor);

    values.push(decoded.updated_at);
    values.push(decoded.id);

    conditions.push(
      `(updated_at, id) < ($${values.length - 1}, $${values.length})`
    );
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  values.push(limit);

  query += `
    ORDER BY updated_at DESC, id DESC
    LIMIT $${values.length}
  `;

  const { rows } = await pool.query(
    query,
    values
  );

  let nextCursor = null;

  if (rows.length === limit) {
    nextCursor = encodeCursor(
      rows[rows.length - 1]
    );
  }

  return {
    count: rows.length,
    nextCursor,
    data: rows,
  };
}