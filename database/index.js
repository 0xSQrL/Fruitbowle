const pg = require('pg-promise')();

module.exports = pg({
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: "localhost",
	port: 5432,
	database: process.env.DB_NAME
});