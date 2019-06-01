const express = require('express');
const db = require.main.require('./../database');
const router = express.Router();




router.generate_db = async function(){
	await db.none(`
		 CREATE TABLE IF NOT EXISTS blog_post (
		 id				bigserial PRIMARY KEY,
		 writer  bigint references users(id) NOT NULL,
		 date_created	timestamp DEFAULT NOW(),
		 title varchar(128),
		 content TEXT,
		 tags VARCHAR[]
		 );
 	`);

	await db.none(`
		 CREATE TABLE IF NOT EXISTS blog_comment (
		 id				bigserial PRIMARY KEY,
		 writer  bigint references users(id) NOT NULL,
		 attached_post  bigint references blog_post(id) NOT NULL,
		 replied  bigint references blog_comment(id) DEFAULT NULL,
		 date_created	timestamp DEFAULT NOW(),
		 content varchar(256)
		 );
 	`);

	await db.none(`
		 CREATE TABLE IF NOT EXISTS blog_impression (
		 viewer  bigint references users(id) NOT NULL,
		 blog_post  bigint references blog_post(id) NOT NULL,
		 review smallint NOT NULL DEFAULT 0,
		 PRIMARY KEY (viewer, blog_post)
		 );
 	`);
};

router.delete_db = async function(){
	await db.none(`
		DROP TABLE IF EXISTS blog_post CASCADE;
		DROP TABLE IF EXISTS blog_comment CASCADE;
		DROP TABLE IF EXISTS blog_impression CASCADE;
	`);
};

module.exports = router;