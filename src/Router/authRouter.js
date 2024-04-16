const express = require ('express');
const { signup, login ,SendOTP,is_verified, logout} = require( '../api/authController.js');


const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/SendOTP', SendOTP);
authRouter.post('/is_verified', is_verified);
// router.post('/logout', logout);



module.exports = authRouter;
