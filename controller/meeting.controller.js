const { Meetings, MeetingTransaction } = require("../repo/db")




const createMeeting = async (req, res) => {
    // try {
    //     let { userId } = req.body
    //     console.log(userId)
    //     if (!userId) res.status(300).send({ error: 'INVALID DATA' })
    //     let meetingInfo = await Meetings.createMeeting(userId)
    //     if (meetingInfo) return res.status(200).send(meetingInfo)
    //     else return res.status(300).send({ error: 'UNABLE TO CREATE  MEETING' })
    // } catch (error) {
    //     console.log(error)
    //     return res.status(400).send(error)
    // }

    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });
        console.log(userId)
        const meeting = await Meetings.createMeeting(userId);
        console.log(meeting)
        await MeetingTransaction.createTransaction(userId, meeting.id, 'created');

        return res.status(200).json({ meeting, message: 'Meeting created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }

}

const joinMeeting = async (req, res) => {
    try {
        const { userId, meetingId } = req.body;
        if (!userId || !meetingId) return res.status(400).json({ error: 'Missing data' });

        const meeting = await Meetings.getMeetingInfo(meetingId);
        if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

        await MeetingTransaction.createTransaction(userId, meetingId, 'joined');

        return res.status(200).json({ message: 'Joined meeting successfully', meeting });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const verifyMeeting=async(req,res)=>{
    const { meetingId } = req.body;

    try {
      const meeting = await Meetings.getMeetingInfo(meetingId);
      if (meeting) {
        return res.json({ success: true, meeting });
      } else {
        return res.status(404).json({ success: false, message: 'Meeting not found' });
      }
    } catch (err) {
      console.error('Meeting verify error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = {
    createMeeting,
    joinMeeting,
    verifyMeeting,
}