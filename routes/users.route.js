const { varifyUser, getAllMeetingAsOwner, getAllMeetingAsMember } = require('../controller/users.controller');

const usersRouter = require('express').Router();

usersRouter.post('/varifyuser', varifyUser)

usersRouter.post('/getallmeetingasowner', getAllMeetingAsOwner)

usersRouter.post('/getallmeetingasmember', getAllMeetingAsMember)


module.exports = { usersRouter }
