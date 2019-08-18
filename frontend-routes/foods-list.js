const express = require('express');
const html_builder = require('../html-builder');
const web_components = require('./web_components');
const {force_ssl, user_has_permission} = web_components;
const db = require.main.require('./../database');
const Elements = html_builder.Elements;


const router = express.Router();

router.get('/', (req, res) => {
	try {
		let page = web_components.standardPage(req.user,
			new Elements.Subpage('private/page-segments/landing-page.html')
		);
		page.set_title("Fruit Bowl Home!");
		res.send(page.to_html());
	}catch (e){
		console.log(e);
	}
});

router.get('/view', (req, res) => {
	try {
		let page = web_components.standardPage(req.user,
			new Elements.Subpage('private/page-segments/landing-page.html')
		);
		page.set_title("Fruit Bowl Home!");
		res.send(page.to_html());
	}catch (e){
		console.log(e);
	}
});

router.get('/edit', (req, res) => {
	try {
		let page;
		if(user_has_permission(req.user, undefined, 2))
			page = web_components.standardPage(req.user,
				new Elements.Subpage('private/page-segments/landing-page.html')
			);
		else
			page = web_components.access_denied_page();
		page.set_title("Fruit Bowl Home!");
		res.send(page.to_html());
	}catch (e){
		console.log(e);
	}
});

module.exports = router;