const html_builder = require.main.require('../html-builder');
const web_components = require('./web_components');
const Elements = html_builder.Elements;

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	if(web_components.force_ssl(req, res))
		return;

    let page = web_components.standardPage(req.user,
        new Elements.Subpage('private/page-segments/login/login-form.html')
    );
    page.set_title("Fruit Login");
    page.add_javascripts("/public/javascripts/login.js");
    res.send(page.to_html());
});

router.get('/register', (req, res) => {

	if(web_components.force_ssl(req, res))
		return;
    let page = web_components.standardPage(req.user,
        new Elements.Subpage('private/page-segments/login/registration-form.html').add_substitution("<CAPTCHA-CLIENT/>", process.env.CAPTCHA_PUBLIC)
    );
    page.set_title("Fruit Register");
	page.add_javascripts("/public/javascripts/login.js");
	page.add_javascripts("https://www.google.com/recaptcha/api.js");
    res.send(page.to_html());
});


router.get('/post-reg', (req, res) => {
	if(web_components.force_ssl(req, res))
		return;
	let email = req.query.email;

	let page = web_components.standardPage(req.user,
		new Elements.Subpage('private/page-segments/login/post-registration.html')
			.add_substitution("<user-email/>", web_components.escape(decodeURI(email)))
			.add_substitution("<system-email/>", process.env.EMAIL_ADDRESS)
	);
	page.set_title("Fruit Register");
	page.add_javascripts("/public/javascripts/login.js");

	res.send(page.to_html());
});

router.get('/change-password', (req, res) => {
	if(web_components.force_ssl(req, res))
		return;
	let email = req.query.email;
	let page = web_components.standardPage(req.user,
		new Elements.Subpage('private/page-segments/login/change-password.html')
	);
	page.set_title("Fruit Register");
	page.add_javascripts("/public/javascripts/login.js");

	res.send(page.to_html());
});

router.get('/validate', (req, res) => {
	if(web_components.force_ssl(req, res))
		return;

    let page = web_components.standardPage(req.user,
		new Elements.Subpage('private/page-segments/login/validate.html')
    );
    page.set_attr("onLoad", "send_validation_request()");
    page.set_title("Fruit Validate");
    page.add_javascripts("/public/javascripts/login.js");
    res.send(page.to_html());
});


module.exports = router;