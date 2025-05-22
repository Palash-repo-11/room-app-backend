const { createMeeting, joinMeeting, verifyMeeting } = require('../controller/meeting.controller');

const meetingRouter = require('express').Router();

meetingRouter.post('/createmeeting', createMeeting)

meetingRouter.post('/joinmeeting', joinMeeting)

meetingRouter.post('/verify', verifyMeeting)

module.exports = { meetingRouter }
