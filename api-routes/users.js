const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require.main.require('./../database');
const jwt = require('jsonwebtoken');
const mail = require.main.require('./../mailer');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.json(req.user);
});

router.post('/login', async function (req, res) {
	let username = req.body.username;
	let password = req.body.password;
	const sha256 = crypto.createHmac("sha256", process.env.JWT_SECRET);

	let userSalt = await db.oneOrNone("SELECT salt FROM users WHERE username=$1", [username]);
	if(!userSalt)
		return res.status(401).json({error: "Username or password invalid"});

	sha256.update(password+userSalt.salt);
	let pwordhash = sha256.digest('hex');

	let user = await db.oneOrNone("SELECT id, username, is_validated, last_password_change FROM users WHERE username=$1 AND passwordhash=$2", [username, pwordhash]);

	if(!user)
		return res.status(401).json({error: "Username or password invalid"});

	if(!user.is_validated)
		return res.status(401).json({error: "Email has not yet been confirmed"});

	res.json({
		token: jwt.sign({id: user.id, username: user.username, last_password_change: user.last_password_change}, process.env.JWT_SECRET)
	});
});

router.put('/change-password', async function (req, res) {
	//Validate Change Password
});

router.post('/request-change', async function (req, res) {
	//Send email
});


router.post('/register', async function (req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let salt = create_salt(16);
    const sha256 = crypto.createHmac("sha256", process.env.JWT_SECRET);
    sha256.update(password+salt);
    let pwordhash = sha256.digest('hex');

    if(!(username && username.length > 2))
        return res.json({success: false, reason: "username"});

    if(!(password && password.indexOf(' ') === -1 && password.length > 2))
        return res.json({success: false, reason: "password"});

    if(!(email && email.indexOf(' ') === -1 && email.length >= 5 && email.indexOf('@') < email.lastIndexOf('.') && email.indexOf('@') !== -1))
        return res.json({success: false, reason: "email"});

    try {
        let user = await db.one("INSERT INTO users (username, email_address, passwordhash, salt) VALUES ($1, $2, $3, $4) " +
            "RETURNING id, username, is_validated", [username, email, pwordhash, salt]);
        let validation = await db.one("INSERT INTO user_validation (user_id, confirmation) VALUES ($1, $2) RETURNING confirmation", [user.id, create_salt(32)]);
        mail.send_mail(email, `${username}! Confirm your registration to FruitBowl Entertainment`,
            `${process.env.SECURE_PORT ? 'https' : 'http'}://${process.env.DOMAIN}/login/validate?username=${encodeURI(username)}&confirmation=${validation.confirmation}`);
        res.json({
            success: true
        });
    }catch (e) {
        if(e.constraint === "unique_email_address")
            return res.json({
                success: false, reason: "emailExists"
            });
        res.json({
            success: false, error: e
        });
    }
});


router.post('/check', async function (req, res) {
    let username = req.query.user;

    let user = await db.oneOrNone("SELECT 1 FROM users WHERE LOWER(username)=LOWER($1)", [username]);

    res.json({
        exists: (user !== null)
    });
});

router.post('/validate', async function (req, res) {
    let username = decodeURI(req.body.username);
    let confirmation = req.body.confirmation;

    let valid = await db.oneOrNone("SELECT users.id as user_id, user_validation.id as validation_id " +
        "FROM users JOIN user_validation ON users.id=user_validation.user_id WHERE LOWER(users.username)=LOWER($1) AND" +
        " user_validation.confirmation=$2",
        [username, confirmation]);

    if(!valid)
        return res.json({
            error: "Not found"
        });

    db.none("UPDATE users SET is_validated=TRUE WHERE id=$1", [valid.user_id]);
    db.none("DELETE FROM user_validation WHERE id=$1", [valid.validation_id]);

    res.json({
        valid: true
    });
});


function create_salt(characterLength){
    let salt = "";
    for(let i = 0; i < characterLength; i ++){
        let value = Math.random() * 36;
        if(value > 10){
            value -= 10;
            salt += String.fromCharCode(value + 65);
        }else
            salt += Math.floor(value);
    }
    return salt;
}



router.generate_db = async function(){
	await db.none(`
		 CREATE TABLE IF NOT EXISTS users (
		 id				BIGSERIAL PRIMARY KEY,
		 username		varchar(32),
		 email_address	varchar(255),
		 passwordhash	varchar(255),
		 salt			varchar(16),
		 is_validated	boolean DEFAULT FALSE,
		 date_created	timestamp DEFAULT NOW(),
		 last_password_change	timestamp DEFAULT NOW()
		 );
		
 		`);

	await db.none(`
		 
		 CREATE UNIQUE INDEX unique_username on users (LOWER(username));
		 CREATE UNIQUE INDEX unique_email_address on users (LOWER(email_address));
		
 		`);

	await db.none(`
		 CREATE TABLE IF NOT EXISTS user_validation (
		 id				BIGSERIAL PRIMARY KEY,
		 user_id		bigint REFERENCES users(id) ON DELETE CASCADE,
		 confirmation	varchar(32)
		 );
 	`);
};

router.delete_db = async function(){
	await db.none(`
	DROP TABLE IF EXISTS users CASCADE;
	DROP TABLE IF EXISTS user_validation CASCADE;
	`);
};



module.exports = router;
