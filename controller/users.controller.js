const { Users, Meetings } = require("../repo/db")


const varifyUser = async (req, res) => {
    try {
        let { userId } = req.body
        if (!userId) res.status(300).send({ error: 'INVALID DATA' })
        let user = await Users.varifyUser(userId)
        if (user?.id) return res.status(200).send({ userStatus: 'EXISTING USER',user, })
        else return res.status(300).send({ userStatus: 'NO USER FOUND' })
        
    } catch (error) {
        console.log(error)
        return res.status(400).send(error)
    }
}



const getAllMeetingAsOwner = async (req, res) => {
    try {
        let { userId } = req.body
        if (!userId) res.status(300).send({ error: 'INVALID DATA' })
        let meetings = await Meetings.allMeetingsAsOwner(userId)
        // console.log(meetings,"meetings")
        return res.status(200).send(meetings)
    } catch (error) {
        console.log(error)
        return res.status(400).send(error)
    }

}


const getAllMeetingAsMember = async (req, res) => {
    try {
        let { userId } = req.body
        if (!userId) res.status(300).send({ error: 'INVALID DATA' })

    } catch (error) {
        console.log(error)
        return res.status(400).send(error)
    }
}



module.exports = {
    varifyUser,
    getAllMeetingAsOwner,
    getAllMeetingAsMember
}