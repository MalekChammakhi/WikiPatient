const client = require('./connection.js')
const express = require('express');
const app = express();
const port = 3300;

app.listen(port, () => {
  console.log(`Server is now listening at port ${port}`);
});

client.connect();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

// app.get('/users', (req, res)=>{
//     client.query(`Select * from users`, (err, result)=>{
//         if(!err){
//             res.send(result.rows);
//             console.log('hhhhhhhh');
//         }
//     });
//     client.end;
// })

// app.post('/update_users', (req, res)=> {
//   const user = req.body;
//   let insertQuery = `insert into users(id, name) 
//                      values(${user.id}, '${user.name}')`

//   client.query(insertQuery, (err, result)=>{
//       if(!err){
//           res.send('Insertion was successful')
//       }
//       else{ console.log(err.message) }
//   })
//   client.end;
// })

app.post('/execute-query', async (req, res) => {
  const query = req.body.query;
  
  try {
    const result = await client.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
});