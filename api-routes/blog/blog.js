const express = require('express');
const router = express.Router();
const db = require.main.require('./../database');



//Functions
////////////
//Write article
//Read article
//Search for article
//Insert redaction
//Delete article
//

router.post('/new', async function (req, res) {
	if(!req.user)
		return res.status(401).json({success: false, reason: "No account"});

	if(!req.body.publish_date)
		req.body.publish_date = new Date();

	if(!req.body.tags)
		req.body.tags = [];

	db.none("INSERT INTO blog_post (writer, date_published, title, content, tags, is_live) VALUES ($1, $2, $3, $4, $5, $6)", [req.user.id, req.body.publish_date, req.body.title, req.body.content, req.body.tags, req.body.is_live])

	return res.status(201).json({success: true});
});


router.put('/update', async function (req, res) {
	if(!req.user)
		return res.status(401).json({success: false, reason: "No account"});

	if(!req.body.publish_date)
		req.body.publish_date = new Date();

	if(!req.body.tags)
		req.body.tags = [];

	db.none("UPDATE blog_post SET date_published=$2, title=$3, content=$4, tags=$5, is_live=$7 WHERE id=$6 AND writer=$1", [req.user.id, req.body.publish_date, req.body.title, req.body.content, req.body.tags, req.body.post_id, req.body.is_live])

	return res.status(202).json({success: true});
});

router.get('/read', async function (req, res) {

	const post = await get_post(req.user, req.body.post_id);

	return res.status(200).json(post);
});

router.get('/get_my_posts', async function (req, res) {

	if(!req.user)
		return res.status(401).json({success: false, reason: "No account"});

	const posts = await db.manyOrNone(`
	SELECT 
		blog_post.id, date_published, date_created, title, tags, is_live, blog_post_rated.rating, blog_post_rated.reviews 
	FROM 
		blog_post JOIN blog_post_rated ON blog_post.id=blog_post_rated.id
	WHERE
		blog_post.writer=$1`, [req.user.id]);

	return res.status(200).json(posts);
});

router.get('/get_author_posts', async function (req, res) {

	const posts = await get_author_posts(req.user, req.query.author);

	return res.status(200).json(posts);
});

router.put('/review', async function (req, res) {

	set_review(req.user, req.body.post_id, req.body.review);

	return res.status(202).json({success: true});
});

async function get_post(reader, post_id){
	const post = await db.oneOrNone(`
		SELECT 
			id, writer, writer_name, date_published, title, content, tags, rating
		FROM 
			blog_post_username
		WHERE id=$1`,
		[post_id]);
	if(reader)
		post.user_rating = get_review(reader.id, post_id);
	return post;
}

async function get_author_posts(reader, writer_id){
	if(reader) {
		return await db.manyOrNone(`
			SELECT 
				id, writer, writer_name, date_published, title, tags, rating, impression.review as user_rating 
			FROM 
				blog_post_username left join 
				(SELECT viewer, review, blog_post FROM blog_impression WHERE viewer=$2) as impression
				ON impression.blog_post=blog_post_username.id
				WHERE writer=$1`,
			[writer_id, reader.id]);
	}
	return await db.manyOrNone("SELECT id, writer, writer_name, date_published, title, tags, rating FROM blog_post_username WHERE writer=$1",
			[writer_id]);
}

//Get the user's opinion of an article, if none exists, set it to the default (0)
async function get_review(reader_id, post_id){
	let impression = await db.oneOrNone("SELECT review FROM blog_impression WHERE viewer=$1 AND blog_post=$2", [reader_id, post_id]);
	if(!impression) {
		db.none("INSERT INTO blog_impression (viewer, blog_post, review) VALUES ($1, $2, $3)", [reader_id, post_id, 0]);
		impression = {review: 0}
	}else
		db.none("UPDATE blog_impression SET last_view=$3 WHERE viewer=$1 AND blog_post=$2", [reader_id, post_id, new Date()]);
	return impression.review;
}

/**
 * Users are not allowed to review articles they have not read
 */
async function set_review(reader_id, post_id, review = 0){
	db.none("UPDATE blog_impression SET review=$3 WHERE viewer=$1 AND blog_post=$2", [reader_id, post_id, review]);
}



module.exports = router;
module.exports.get_post = get_post;
module.exports.get_author_posts = get_author_posts;

/**


 */