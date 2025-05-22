const { userLogin } = require('../controller/login.cotroller');

const loginRouter = require('express').Router();

loginRouter.post('/newuser',userLogin)


module.exports={loginRouter}

