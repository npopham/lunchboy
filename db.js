const pgp = require('pg-promise')({
    
});

const cn = {
	connectionString: process.env.DATABASE_URL,
	ssl: true
};

module.exports = pgp(cn);