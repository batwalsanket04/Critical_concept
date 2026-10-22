 
const { Pool } = require("pg");
require("dotenv").config();


const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.connect()
    .then((client) => {
        console.log("PG connected");
        client.release();
    })
    .catch((error) => {
        console.log("Failed to Connect");
        console.log(error.message);
    });

module.exports = pool;
 