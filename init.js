const pool = require('./pool')

const { OPTIONS } = require('./config')


async function init() {
    try {
        await pool.connect(OPTIONS)

        await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
        await pool.query(`
           CREATE TABLE IF NOT EXISTS users(
                id TEXT PRIMARY KEY DEFAULT uuid_generate_v1(),
                email TEXT UNIQUE NOT NULL ,
                name TEXT NOT NULL,
                profile_image TEXT
           )
        `)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS meetings(
                id TEXT PRIMARY KEY DEFAULT uuid_generate_v1(),
                owner_id TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(owner_id)
                REFERENCES users(id)
                ON UPDATE CASCADE
                ON DELETE CASCADE
            )
        `)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS meeting_transaction (
                transaction_id TEXT PRIMARY KEY DEFAULT uuid_generate_v1(),
                user_id TEXT NOT NULL,
                meeting_id TEXT NOT NULL,
                event TEXT NOT NULL CHECK (event IN ('created', 'joined', 'left', 'ended', 'share', 'stop')),
                update_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE,
                FOREIGN KEY (meeting_id)
                    REFERENCES meetings(id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
            );
        `)
        console.log("Tables created successfully.");
    } catch (err) {
        console.error("Error initializing database:", err);
    } finally {
        await pool.close();
    }
}

init();