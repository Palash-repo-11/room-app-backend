const pool = require('../pool')
const toCamelCase = require('./utils/toCamelCase')


class Users {
    static async login(email, name, profileImage = null) {
        // Check if user already exists
        let profile_image = null
        if (profileImage) profile_image = profileImage
        const existing = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (existing.rows.length > 0) {
            return toCamelCase(existing.rows)[0];
        }

        // Insert new user if not exists
        const { rows } = await pool.query(`
        INSERT INTO users(email, name, profile_image)
        VALUES($1, $2, $3)
        RETURNING *
        `, [email, name, profile_image]);

        return toCamelCase(rows)[0];
    }
    static async varifyUser(userId) {
        // console.log(userId)
        const { rows } = await pool.query(`
                SELECT *
                FROM users 
                where id=$1
            `, [userId]);
        // console.log(rows)
        return toCamelCase(rows)[0];
    }

}


class Meetings {

    static async createMeeting(ownerId) {
        const { rows } = await pool.query(`
            INSERT INTO meetings(owner_id) VALUES($1) RETURNING *;
        `, [ownerId])
        return toCamelCase(rows)[0]
    }

    static async allMeetingsAsOwner(ownerId) {
        const { rows } = await pool.query(`
            SELECT * 
            FROM meetings
            WHERE owner_id = $1 
        `, [ownerId])
        return toCamelCase(rows)
    }

    static async allMeetingsAsMember(userId) {
        const { rows } = await pool.query(`
            SELECT * 
            FROM meetings
            WHERE id IN (SELECT DISTINCT meeting_id 
                          FROM meeting_transaction
                          WHERE event='joined' AND user_id=$1
                        )
        `, [userId])
        return toCamelCase(rows)
    }
    static async getMeetingInfo(meetingId) {
        const { rows } = await pool.query(`
                SELECT *
                FROM meetings
                WHERE id=$1
        `, [meetingId])
        return toCamelCase(rows)[0]
    }

}

class MeetingTransaction {
    static async createTransaction(userId, meetingId, event) {
        const { rows } = await pool.query(`
            INSERT INTO meeting_transaction (user_id,meeting_id,event) VALUES ($1,$2,$3);
        `, [userId, meetingId, event])
    }
    static async getAllMeetingTransaction(meetingId) {
        const { rows } = await pool.query(`
            SELECT * 
            FROM meetings
            WHERE id = $1
        `, [meetingId])
        return toCamelCase(rows)
    }


}

module.exports = {
    Users,
    Meetings,
    MeetingTransaction,
}
