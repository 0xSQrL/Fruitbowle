const express = require('express');
const filesystem = require('fs');
const users = require('./users');
const tracking = require('./tracking');
const {force_ssl, user_has_permission} = require('../frontend-routes/web_components');
const blog = require('./blog');
const java = require('./java_compiler');
const banned_food = require('./banned-food');

const router = express.Router();


router.get('/', (request, response) => {
    filesystem.readFile('./api-routes/Access.html', 'utf8', function (err, contents) {
        response.send(contents);
    });
});

let timeSinceLastRebuild = 0;

router.post('/rebuild_dbs', async (req, res) =>{
	if(new Date().getTime() > timeSinceLastRebuild + 1000) {
		console.log("Rebuilding");
		timeSinceLastRebuild = new Date().getTime();
		if (force_ssl(req, res))
			return;
		if (!req.body)
			return res.status(401).json({success: false, error: "No body"});
		if (user_has_permission(req.user, req.body.password, 2)) {
			console.log("Deleting Blog");
			await blog.delete_db();
			console.log("Deleting Tracker");
			await tracking.delete_db();
			console.log("Deleting Banned Food");
			let tmpBanned = await banned_food.delete_db();
			console.log("Deleting Users");
			let tmpUsers = await users.delete_db();
			if(!req.body.migrate) {
				tmpUsers = undefined;
				tmpBanned = undefined;
			}
			console.log("Building Users");
			await users.generate_db(tmpUsers);
			console.log("Building Tracker");
			await tracking.generate_db();
			console.log("Building Blog");
			await blog.generate_db();
			console.log("Building Banned Food");
			await banned_food.generate_db(tmpBanned);
			return res.status(200).json({success: true, error: "You rebuilt everything, you monster"});
		}else{
			return res.status(401).json({success: false, error: "Invalid permissions"});
		}
	}
	return res.status(401).json({success: false, error: "IDK Something went wrong"});
});

router.use('/users', users);

router.use('/tracker', tracking);

router.use('/blog', blog);

router.use('/banned-food', banned_food);


module.exports = router;
