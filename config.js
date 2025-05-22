const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    PORT: process.env.PORT,
    OPTIONS: {
        user: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOSTNAME,
        port: process.env.POSTGRES_PORT,
        database: process.env.DATABASE_NAME
    }
}