const { config } = require('dotenv');
config();
const { initDb } = require('./dbConfig');
const { connectionConfig } = require ('./dbConfig.js') ; 
const { Pool } = require('pg');
const express = require('express');
const authRouter = require('./src/Router/authRouter.js')  ;
const userRouter = require ('./src/Router/userRouter.js');
const sqlRouter = require('./src/Router/sqlRouter.js');
const dotenv = require('dotenv');
dotenv.config();



const pool = new Pool(connectionConfig);
initDb();

//////////////////////////////////////////////////
const app = express();
app.use(express.json());

const cors = require ('cors');
app.use(cors());


app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/sql',sqlRouter);
app.use('/assets', express.static('assets'));







const PORT = 8081 ;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});