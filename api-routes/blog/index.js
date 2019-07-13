const express = require('express');
const db = require.main.require('./../database');
const router = express.Router();
const blogging_routes = require("./blog");

const default_post_rating = 3;

router.use("/", blogging_routes);


router.generate_db = async function(){
	console.log("blog_post");
	await db.none(`
		 CREATE TABLE IF NOT EXISTS blog_post (
		 id				bigserial PRIMARY KEY,
		 writer  bigint references users(id) NOT NULL,
		 date_created	timestamp DEFAULT NOW(),
		 date_published	timestamp DEFAULT NOW(),
		 is_live boolean DEFAULT FALSE,
		 title varchar(128),
		 content TEXT,
		 tags VARCHAR(20)[]
		 );
 	`);

	console.log("blog_impression");
	await db.none(`
		 CREATE TABLE IF NOT EXISTS blog_impression (
		 viewer  bigint references users(id) NOT NULL,
		 blog_post  bigint references blog_post(id) NOT NULL,
		 review smallint NOT NULL DEFAULT 0,
		 last_view timestamp NOT NULL DEFAULT NOW(),
		 PRIMARY KEY (viewer, blog_post)
		 );
 	`);

	console.log("blog_post_rated");
	await db.none(`
		 CREATE VIEW blog_post_rated AS 
		 	(SELECT 
		 		blog_post.id,
		 		COALESCE(AVG(blog_impression.review), ${default_post_rating}) as rating,
		 		COUNT(blog_impression.review) as reviews
		 	FROM blog_post LEFT JOIN blog_impression ON
		 		blog_post.id=blog_impression.blog_post
		 	WHERE blog_impression.review<>0 or blog_impression.review is null
		 	GROUP BY blog_post.id);
 	`);

	console.log("blog_post_live");
	await db.none(`
		 CREATE VIEW blog_post_live AS 
		 	(SELECT 
		 		blog_post.id, 
		 		blog_post.writer,
		 		blog_post.date_created, 
		 		blog_post.date_published,
		 		blog_post.title, 
		 		blog_post.content, 
		 		blog_post.tags,
		 		blog_post_rated.rating,
		 		blog_post_rated.reviews
		 	FROM blog_post JOIN blog_post_rated ON
		 		blog_post.id=blog_post_rated.id
		 	WHERE blog_post.date_published < NOW() AND blog_post.is_live='t');
 	`);

	console.log("blog_post_username");
	await db.none(`
		 CREATE VIEW blog_post_username AS 
		 	(SELECT 
		 		blog_post_live.id, 
		 		blog_post_live.writer, 
		 		users.username as writer_name, 
		 		blog_post_live.date_created, 
		 		blog_post_live.date_published,
		 		blog_post_live.title, 
		 		blog_post_live.content, 
		 		blog_post_live.tags,
		 		blog_post_live.rating 
		 	FROM blog_post_live JOIN users 
		 		ON users.id=blog_post_live.writer);
 	`);

	console.log("blog_profile_relation");

	await db.none(`
		 CREATE TABLE IF NOT EXISTS blog_profile_relation (
		 id				bigserial PRIMARY KEY,
		 writer  bigint references users(id) NOT NULL,
		 date_created	timestamp DEFAULT NOW(),
		 date_published	timestamp DEFAULT NOW(),
		 is_deleted boolean DEFAULT FALSE,
		 title varchar(128),
		 content TEXT,
		 tags VARCHAR(20)[]
		 );
 	`);

	console.log("blog_comment");

	await db.none(`
		 CREATE TABLE IF NOT EXISTS blog_comment (
		 id				bigserial PRIMARY KEY,
		 writer  bigint references users(id) NOT NULL,
		 attached_post  bigint references blog_post(id) NOT NULL,
		 replied  bigint references blog_comment(id) DEFAULT NULL,
		 date_created	timestamp DEFAULT NOW(),
		 is_deleted		boolean DEFAULT FALSE,
		 content varchar(256)
		 );
 	`);
	console.log("blog_comment_review");

	await db.none(`
		 CREATE TABLE IF NOT EXISTS blog_comment_review (
		 viewer  bigint references users(id) NOT NULL,
		 comment  bigint references blog_comment(id) NOT NULL,
		 review smallint NOT NULL DEFAULT 0,
		 PRIMARY KEY (viewer, comment)
		 );
 	`);
	console.log("blog_comment_rating");


	await db.none(`
		 CREATE VIEW blog_comment_rating AS 
		 	(SELECT 
		 		blog_comment.id,
		 		SUM(blog_comment_review.review) as rating
		 	FROM blog_comment JOIN blog_comment_review 
		 		ON blog_comment.id=blog_comment_review.comment
		 		WHERE blog_comment.is_deleted='f' AND blog_comment_review.review<>0
		 		GROUP BY blog_comment.id);
 	`);


	console.log("blog_comment_username");

	await db.none(`
		 CREATE VIEW blog_comment_username AS 
		 	(SELECT 
		 		blog_comment.id, 
		 		blog_comment.writer,
		 		users.username,
		 		blog_comment.content, 
		 		blog_comment.date_created,
		 		blog_comment.attached_post,
		 		blog_comment_rating.rating
		 	FROM blog_comment JOIN blog_comment_rating 
		 		ON blog_comment.id=blog_comment_rating.id JOIN users on blog_comment.writer=users.id
		 		WHERE blog_comment.is_deleted='f');
 	`);

};

router.delete_db = async function(){
	await db.none(`
		DROP TABLE IF EXISTS blog_post CASCADE;
		DROP TABLE IF EXISTS blog_comment CASCADE;
		DROP TABLE IF EXISTS blog_impression CASCADE;
		DROP TABLE IF EXISTS blog_comment_review CASCADE;
		DROP VIEW IF EXISTS blog_comment_rating CASCADE;
		DROP VIEW IF EXISTS blog_post_username CASCADE;
		DROP VIEW IF EXISTS blog_comment_username CASCADE;
	`);
};

module.exports = router;