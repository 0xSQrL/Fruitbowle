const html_builder = require.main.require('../html-builder');
const web_components = require('./web_components');
const Elements = html_builder.Elements;
const {get_post, get_author_posts} = require('../api-routes/blog/blog');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
		let page = web_components.standardPage(req.user,
			new Elements.Subpage('private/page-segments/blog/tools/stars.html').add_substitution("<width/>", 2 * 100)
		);
		page.add_javascripts("/public/javascripts/blog_scripts.js");
		page.set_title("Fruit Bowl Home!");
		res.send(page.to_html());
});



module.exports = router;