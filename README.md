# Product Catalog Backend

A backend service built using **Node.js**, **Express.js**, and **PostgreSQL (Neon)** that supports browsing a catalog of **200,000+ products** with filtering and high-performance pagination.

---

## Tech Stack

* **Node.js**
* **Express.js**
* **PostgreSQL (Neon)**
* **pg**
* **Zod**

---

## Features

* Browse products sorted by newest first.
* Filter products by category.
* Cursor-based pagination.
* Handles changing datasets without duplicates or missing records.
* Efficiently seeds 200,000 products.
* Optimized with database indexes.

---

## API Endpoint

### Get Products

```http
GET /api/products
```

### Query Parameters

| Parameter  | Type   | Description                                          |
| ---------- | ------ | ---------------------------------------------------- |
| `limit`    | Number | Number of products to return (default: 20, max: 100) |
| `category` | String | Filter products by category                          |
| `cursor`   | String | Cursor for fetching the next page                    |

### Example Requests

```http
GET /api/products?limit=20
```

```http
GET /api/products?category=Books
```

```http
GET /api/products?limit=20&cursor=<cursor>
```

---

## Why Cursor Pagination?

I chose **cursor-based pagination** instead of traditional offset pagination because the dataset is large and changes frequently.

### Problems with Offset Pagination

* Performance degrades significantly on large datasets.
* Newly inserted or updated records can cause:

  * Duplicate products across pages.
  * Missing products while browsing.

Example:

A user loads page 1 and, before requesting page 2, new products are inserted at the top. Using `OFFSET` may shift records, causing inconsistent results.

### Benefits of Cursor Pagination

* Consistent results while data changes.
* No duplicate or missing products.
* Better scalability for large datasets.
* Query performance remains stable even with hundreds of thousands of records.

Pagination is implemented using:

```sql
ORDER BY updated_at DESC, id DESC
```

The cursor stores:

```json
{
  "updated_at": "...",
  "id": "..."
}
```

---

## Why PostgreSQL + Neon?

### PostgreSQL

PostgreSQL was chosen because it provides:

* Strong indexing capabilities.
* Excellent support for ordered queries.
* Efficient execution of keyset pagination.
* Reliability and production readiness.

### Neon

Neon was selected because:

* It offers a generous free tier.
* It is fully managed.
* It provides serverless PostgreSQL.
* Easy deployment and integration with Node.js applications.

---

## Database Indexing Strategy

To ensure fast queries, the following indexes were added:

```sql
CREATE INDEX idx_updated_id
ON products(updated_at DESC, id DESC);
```

```sql
CREATE INDEX idx_category_updated_id
ON products(category, updated_at DESC, id DESC);
```

### Why these indexes?

The application frequently executes queries such as:

```sql
SELECT *
FROM products
WHERE category = $1
AND (updated_at, id) < ($2, $3)
ORDER BY updated_at DESC, id DESC
LIMIT 20;
```

These composite indexes allow PostgreSQL to efficiently:

* Filter by category.
* Traverse records in sorted order.
* Avoid full table scans.

---

## Complexity Analysis

### Fetch First Page

```sql
ORDER BY updated_at DESC
LIMIT 20
```

Approximate complexity:

```text
O(log N + K)
```

Where:

* `N` = total records
* `K` = number of returned rows

---

### Fetch Subsequent Pages

```sql
WHERE (updated_at, id) < (...)
ORDER BY updated_at DESC, id DESC
LIMIT K
```

Approximate complexity:

```text
O(log N + K)
```

Since the query uses indexed columns, performance remains efficient even as the dataset grows.

---

## Seeding Strategy

The database is seeded with **200,000 products** using batch inserts.

Instead of inserting records one by one, products are generated and inserted in batches of 5,000 rows.

Benefits:

* Faster execution.
* Fewer database round trips.
* Reduced overhead.

---

## Future Improvements

Given more time, I would add:

* Automated tests for pagination correctness.
* API rate limiting.
* Redis caching for popular queries.
* Cursor signing/encryption to prevent tampering.
* Docker support.
* Query performance benchmarking.
* API documentation using Swagger/OpenAPI.

---

## AI Usage

AI tools were used primarily for:

* Discussing architecture options.
* Comparing pagination strategies.
* Reviewing indexing approaches.
* Accelerating boilerplate implementation.

All architectural decisions, database design choices, and pagination logic were verified and understood before implementation.

AI suggestions that did not fit the requirements (such as offset pagination) were intentionally rejected after evaluating their trade-offs.
