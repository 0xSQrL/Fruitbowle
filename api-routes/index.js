const express = require('express');
const filesystem = require('fs');
const users = require('./users');
const tracking = require('./tracking');
const {force_ssl} = require('../frontend-routes/web_components');
const blog = require('./blog');
const java = require('./java_compiler');

const router = express.Router();


router.get('/', (request, response) => {
    filesystem.readFile('./api-routes/Access.html', 'utf8', function (err, contents) {
        response.send(contents);
    });
});

let timeSinceLastRebuild = 0;

router.post('/rebuild_dbs', async (req, res) =>{
	if(new Date().getTime() > timeSinceLastRebuild + 30000) {
		console.log("Rebuilding");
		timeSinceLastRebuild = new Date().getTime();
		if (force_ssl(req, res))
			return;
		if (!req.body)
			return res.status(401).json({success: false, error: "No body"});
		if (!req.body.password)
			return res.status(401).json({success: false, error: "No Password"});
		if (req.body.password === process.env.EMAIL_PASSWORD) {
			console.log("Deleting Blog");
			await blog.delete_db();
			console.log("Deleting Tracker");
			await tracking.delete_db();
			console.log("Deleting Users");
			await users.delete_db();

			console.log("Building Users");
			await users.generate_db();
			console.log("Building Tracker");
			await tracking.generate_db();
			console.log("Building Blog");
			await blog.generate_db();
			return res.status(200).json({success: true, error: "You rebuilt everything, you monster"});
		}
	}
	return res.status(401).json({success: false, error: "IDK Something went wrong"});
});

router.use('/users', users);

router.use('/tracker', tracking);

router.use('/blog', blog);


module.exports = router;
