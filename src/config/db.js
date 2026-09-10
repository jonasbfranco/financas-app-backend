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

const cpool = new Pool({
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL
})


export default pool;