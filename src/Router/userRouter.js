const express = require ('express');
const {getUser  } = require ('../api/UserController.js');

const userRouter = express.Router();


userRouter.get('/getuser', getUser);




module.exports= userRouter;