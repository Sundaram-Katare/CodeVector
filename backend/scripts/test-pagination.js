import { fetchProducts } from "../services/product.service.js";
import { pool } from "../config/db.js";
import { faker } from "@faker-js/faker";
import crypto from "crypto";


async function testPagination() {
  console.log("=== Testing Pagination Behavior ===\n");

  // ---------------------------------------------------------
  // STEP 1: Fetch the first page of products (simulate user loading the website)
  // ---------------------------------------------------------
  console.log("[Step 1] User fetches Page 1...");
  
  // We request exactly 10 items
  const page1 = await fetchProducts({ limit: 10 });
  console.log(`Fetched ${page1.data.length} products.`);
  console.log(`Cursor for next page:`, page1.nextCursor);
  
  // We store the IDs of the products we just saw to check for duplicates later
  const seenIds = new Set(page1.data.map(product => product.id));

  // ---------------------------------------------------------
  // STEP 2: Simulate 50 new products being added by other users
  // ---------------------------------------------------------
  console.log("\n[Step 2] Simulating 50 new products inserted in the background...");
  const values = [];
  const placeholders = [];
  
  for (let j = 0; j < 50; j++) {
    const idx = j * 6;
    placeholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6})`);
    values.push(
      crypto.randomUUID(),
      faker.commerce.productName(), // Random name
      "Electronics",                // Category
      faker.number.float({ min: 10, max: 100, fractionDigits: 2 }), // Price
      new Date(),                   // created_at
      new Date()                    // updated_at
    );
  }
  
  // Insert the 50 items directly into the database
  await pool.query(
    `INSERT INTO products (id, name, category, price, created_at, updated_at) VALUES ${placeholders.join(",")}`,
    values
  );
  console.log("✅ 50 new products successfully added to the top of the database.");

  // ---------------------------------------------------------
  // STEP 3: Fetch the second page using the cursor from Page 1
  // ---------------------------------------------------------
  console.log("\n[Step 3] User clicks 'Next Page' (fetching Page 2 using the saved cursor)...");
  
  // Notice we pass `cursor: page1.nextCursor` so the database knows exactly where we left off
  const page2 = await fetchProducts({ limit: 10, cursor: page1.nextCursor });
  console.log(`Fetched ${page2.data.length} products on Page 2.`);

  // ---------------------------------------------------------
  // STEP 4: Validate the results (The core of the test)
  // ---------------------------------------------------------
  let duplicates = 0;
  
  // Check if ANY item on Page 2 was already seen on Page 1
  for (const product of page2.data) {
    if (seenIds.has(product.id)) {
      duplicates++;
      console.error(`❌ DUPLICATE FOUND: Product ID ${product.id} was on Page 1 and is now repeated on Page 2!`);
    }
  }

  // Print the final test result
  console.log("\n---------------------------------------------------");
  if (duplicates === 0) {
    console.log("✅ SUCCESS: 0 duplicates found.");
    console.log("Cursor-based pagination successfully ignored the 50 new items inserted at the top of the feed.");
    console.log("If we used LIMIT/OFFSET, we would have seen 10 duplicates here because the data shifted down!");
  } else {
    console.log(`❌ FAILED: Found ${duplicates} duplicates.`);
  }
  console.log("---------------------------------------------------\n");

  process.exit(0);
}

// Execute the test
testPagination();
