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
    page.add_javascripts("/public/javascripts/tracker.js");
    res.send(page.to_html());
});

module.exports = router;