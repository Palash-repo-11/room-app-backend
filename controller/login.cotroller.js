const { Users } = require("../repo/db")


const userLogin = async (req, res) => {
    try {
        let { email, name, profileImage } = req.body
        if (!email && !name)  res.status(300).send({error:'INVALID DATA'})
        console.log(email, name, profileImage)
        let user = await Users.login(email, name, profileImage)
        return res.status(200).send(user)
    } catch (error) {
        console.log(error)
        return res.status(400).send(error)
    }
}



module.exports = {
    userLogin
}