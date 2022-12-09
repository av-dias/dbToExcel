const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const db = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

db.connect((err) => {
  if (err) {
    return console.log(err);
  }
  console.log("DB Connected!");
});

module.exports = db;
