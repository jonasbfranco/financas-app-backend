import "dotenv/config";

import pg from "pg";

const { Pool } = pg;

/* const pool = new Pool({
    connectionString: process.env.DATABASE_URL
}); */
/* 
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
}); */

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL ou POSTGRES_URL não foi configurada."
  );
}

const pool = new Pool({
  connectionString
});


export default pool;