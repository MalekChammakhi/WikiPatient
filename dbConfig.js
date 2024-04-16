const { Pool } = require('pg');
require('dotenv').config(); // Charge les variables d'environnement depuis .env

const { createUsersTableQuery } = require('./src/models/UserModel.js');

const connectionConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const pool = new Pool(connectionConfig);

async function initDb() {
  try {
    await pool.query(createUsersTableQuery);
    console.log('Users table created or verified successfully.');
  } catch (err) {
    console.error('Error during database initialization:', err.stack);
    process.exit(1);
  }
}

module.exports = { connectionConfig, initDb };
