const express = require ('express');
const { sql } = require( '../api/sqlController.js');


const sqlRouter = express.Router();

sqlRouter.post('/execute-query', sql);


module.exports = sqlRouter;
