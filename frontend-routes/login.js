const html_builder = require.main.require('../html-builder');
const web_components = require('./web_components');
const Elements = html_builder.Elements;

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {

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

    let page = web_components.standardPage(req.user,
        new Elements.Form(
            "Username", Elements.SimpleBreak,
            new Elements.Form.TextField("username"), new Elements.Span().set_attr("class","error").set_attr("id", "usernameError"), Elements.SimpleBreak,
            "Email Address", Elements.SimpleBreak,
            new Elements.Form.TextField("email"), new Elements.Span().set_attr("class","error").set_attr("id", "emailError"), Elements.SimpleBreak,
            "Password", Elements.SimpleBreak,
            new Elements.Form.PasswordField("password"), new Elements.Span().set_attr("class","error").set_attr("id", "passwordError"), Elements.SimpleBreak,
            "Re-enter Password", Elements.SimpleBreak,
            new Elements.Form.PasswordField("password2"), new Elements.Span().set_attr("class","error").set_attr("id", "password2Error"),
            Elements.SimpleBreak,
            Elements.SimpleBreak,
            new Elements.Form.SubmitButton("Register").set_attr("onClick", "return send_registration_request()")
        ).set_attr("id", "registration")
    );
    page.set_title("Fruit Register");
    page.add_javascripts("/public/javascripts/login.js");
    res.send(page.to_html());
});


router.get('/post-reg', (req, res) => {

    let email = req.query.email;

    let page = web_components.standardPage(req.user,
        new Elements.Divider(
            new Elements.Heading(2, "Thank you for registering!"), Elements.SimpleBreak,
            new Elements.Span(`An email has been sent to <i>${email}</i> from <i>noreply.fruitbowle@gmail.com</i>. 
                To complete your registration and validate your account, please go to your email and click the provided link.`)
        )
    );
    page.set_title("Fruit Register");
    page.add_javascripts("/public/javascripts/login.js");
    res.send(page.to_html());
});



router.get('/validate', (req, res) => {

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