const express = require('express');
const db = require.main.require('./../database');
const router = express.Router();
const {force_ssl, user_has_permission} = require('../../frontend-routes/web_components');


router.post("/", async (req, res) =>{

	if (force_ssl(req, res))
		return;
	if (!req.body)
		return res.status(401).json({success: false, error: "No body"});
	if (user_has_permission(user, req.body.password, 2)) {
		db.none(`INSERT INTO banned_food (ranking, name, reasoning)
			VALUES
			($1, $2, $3)`, [
			req.body.ranking,
			req.body.name,
			req.body.reasoning]);
	}else{
		return res.status(401).json({success: false, error: "Invalid permissions"});
	}

	return res.status(200).json({success: true});
});

router.get("/", async (req, res) =>{

	let id = req.query.id ? req.query.id : undefined;
	let startIndex = req.query.start ? req.query.start : 0;
	let takeLimit = req.query.limit ? req.query.limit : 20;
	let searchCriteria = req.query.criteria ? req.query.criteria : undefined;

	let results = {};

	if(id) {
		results = await db.oneOrNone(`SELECT id, ranking, name, reasoning, last_updated FROM banned_food WHERE id=$1`, [id]);
	}else if (searchCriteria) {
		results = await db.manyOrNone(`SELECT id, ranking, name, reasoning, last_updated FROM banned_food WHERE name ~* $1 OFFSET $2 LIMIT $3`, [searchCriteria, startIndex, takeLimit]);
	}else{
			results = await db.manyOrNone(`SELECT id, ranking, name, reasoning, last_updated FROM banned_food OFFSET $1 LIMIT $2`, [startIndex, takeLimit]);
	}
	return res.status(200).json(results);
});

router.put("/", async (req, res) =>{

	if (force_ssl(req, res))
		return;
	if (!req.body)
		return res.status(401).json({success: false, error: "No body"});
	if (!req.body.password)
		return res.status(401).json({success: false, error: "No Password"});
	if (user_has_permission(user, req.body.password, 2)) {
		db.none(`UPDATE banned_food SET ranking=$1, name=$2, reasoning=$3, last_updated=$4
			WHERE id=$5`, [
			req.body.ranking,
			req.body.name,
			req.body.reasoning,
			new Date(),
			req.body.id
		]);
	}

	return res.status(200).json({success: true});
});


router.generate_db = async function(savings){
	console.log("banned_food");
	await db.none(`
		 CREATE TABLE IF NOT EXISTS banned_food (
		 id					bigserial PRIMARY KEY,
		 ranking			smallint NOT NULL,
		 name 				varchar(128),
		 reasoning			varchar(255),
		 date_created		timestamp DEFAULT NOW(),
		 last_updated		timestamp DEFAULT NOW()
		 );
 	`);

	if(savings && savings.foods){
		savings.foods.forEach(food_item=>{
			db.none(`INSERT INTO banned_food (id, ranking, name, reasoning, date_created,last_updated)
			VALUES
			($1, $2, $3, $4, $5, $6)`, [food_item.id,
				food_item.ranking,
				food_item.name,
				food_item.reasoning,
				food_item.date_created,
				food_item.last_updated]);
		});
	}

};

router.delete_db = async function(){
	let saving = {};
	try {

	saving = {
		foods: await db.manyOrNone('SELECT * FROM banned_food'),
	};

	}catch (e) {

	}
	await db.none(`
		DROP TABLE IF EXISTS banned_food CASCADE;
	`);

	return saving;
};

module.exports = router;