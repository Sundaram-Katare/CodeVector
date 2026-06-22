export function encodeCursor(product) {
  const cursorData = {
    updated_at: product.updated_at,
    id: product.id,
  };

  return Buffer.from(
    JSON.stringify(cursorData)
  ).toString("base64");
}

export function decodeCursor(cursor) {
  const decoded = Buffer.from(
    cursor,
    "base64"
  ).toString();

  return JSON.parse(decoded);
}