const { config } = require ('dotenv');
const { connectionConfig } = require ('../../dbConfig.js');

const { Pool } = require('pg');

config();
const dotenv = require('dotenv');

dotenv.config();
const pool = new Pool(connectionConfig);

const sql = async (req, res) => {
    const query = req.body.query;
    
    try {
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error(error.stack);
      res.status(500).json({ error: error.message });
    }
  };

  module.exports={sql};
// app.post('/execute-query', async (req, res) => {
//     const query = req.body.query;
    
//     try {
//       const result = await client.query(query);
//       res.json(result.rows);
//     } catch (error) {
//       console.error(error.stack);
//       res.status(500).json({ error: error.message });
//     }
//   });