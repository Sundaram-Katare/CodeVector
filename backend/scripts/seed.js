import { faker } from "@faker-js/faker";
import crypto from "crypto";
import { pool } from "../config/db.js";

const categories = [
  "Electronics",
  "Fashion",
  "Books",
  "Sports",
  "Beauty",
  "Home",
  "Toys",
  "Grocery",
];

const TOTAL = 200000;
const BATCH_SIZE = 5000;

async function seed() {
  try {
    for (
      let i = 0;
      i < TOTAL;
      i += BATCH_SIZE
    ) {
      const values = [];
      const placeholders = [];

      for (let j = 0; j < BATCH_SIZE; j++) {
        const idx = j * 6;

        placeholders.push(
          `($${idx + 1},
            $${idx + 2},
            $${idx + 3},
            $${idx + 4},
            $${idx + 5},
            $${idx + 6})`
        );

        values.push(
          crypto.randomUUID(),
          faker.commerce.productName(),
          faker.helpers.arrayElement(categories),
          faker.number.float({
            min: 100,
            max: 10000,
            fractionDigits: 2,
          }),
          faker.date.past(),
          faker.date.recent()
        );
      }

      await pool.query(
        `
        INSERT INTO products
        (id,name,category,price,created_at,updated_at)
        VALUES
        ${placeholders.join(",")}
      `,
        values
      );

      console.log(
        `${i + BATCH_SIZE} inserted`
      );
    }

    console.log("Seeding finished");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

seed();