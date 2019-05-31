const html_builder = require.main.require('../html-builder');
const web_components = require('./web_components');
const Elements = html_builder.Elements;

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	if(web_components.force_ssl(req, res))
		return;

    let page = web_components.standardPage(req.user,
        new Elements.Form(
            "Username", Elements.SimpleBreak,
            new Elements.Form.TextField("username"), Elements.SimpleBreak,
            "Password", Elements.SimpleBreak,
            new Elements.Form.PasswordField("password"),
            Elements.SimpleBreak,
            Elements.SimpleBreak,
            new Elements.Form.SubmitButton("Login").set_attr("onClick", "return send_login_request()")
        ).set_attr("id", "login")
    );
    page.set_title("Fruit Login");
    page.add_javascripts("/public/javascripts/login.js");
    res.send(page.to_html());
});

router.get('/register', (req, res) => {

	if(web_components.force_ssl(req, res))
		return;
    let page = web_components.standardPage(req.user,
        new Elements.Subpage('private/page-segments/login/registration-form.html')
    );
    page.set_title("Fruit Register");
    page.add_javascripts("/public/javascripts/login.js");
    res.send(page.to_html());
});


router.get('/post-reg', (req, res) => {

	if(web_components.force_ssl(req, res))
		return;
    let email = req.query.email;

	let content = new Elements.Subpage('private/page-segments/login/post-registration.html');
	content.add_substitution("<user-email/>", web_components.escape(decodeURI(email)));
	content.add_substitution("<system-email/>", process.env.EMAIL_ADDRESS);
    let page = web_components.standardPage(req.user,
		content
    );
    page.set_title("Fruit Register");
    page.add_javascripts("/public/javascripts/login.js");
    res.send(page.to_html());
});



router.get('/validate', (req, res) => {
	if(web_components.force_ssl(req, res))
		return;

    let page = web_components.standardPage(req.user,
        new Elements.Center(
            new Elements.Heading(2, "Loading...").set_attr("id", "status"),
            Elements.SimpleBreak,
            new Elements.Span().set_attr("id", "further")
        )
    );
    page.set_attr("onLoad", "send_validation_request()");
    page.set_title("Fruit Validate");
    page.add_javascripts("/public/javascripts/login.js");
    res.send(page.to_html());
});


module.exports = router;