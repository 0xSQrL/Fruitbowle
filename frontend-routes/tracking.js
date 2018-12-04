const html_builder = require.main.require('../html-builder');
const web_components = require('./web_components');
const Elements = html_builder.Elements;
const tracker_utils = require.main.require('./../utils/tracker');

const express = require('express');
const router = express.Router();


router.get('/', async function(req, res){

    let page = web_components.standardPage(req.user);
    let tracker_id;
    if(tracker_id = await tracker_utils.getUserTrackerId(req.user.id)){
        page.add_contents(new Elements.Heading(2, "Welcome Back!"), `Your current status ${tracker_id}`);
    }else{
        page.add_contents(new Elements.Form(
            "4-Digit PIN Number", Elements.SimpleBreak,
            new Elements.Form.PasswordField("pin").set_attr("maxLength", 4).set_attr('onkeypress', 'force_only_number(this)'),
			new Elements.Span().set_attr("id", "pinError").set_attr("class", "error"),
			Elements.SimpleBreak,
            new Elements.Form.SubmitButton("Create Tracker Account").set_attr("onClick", "return send_create_tracker_request()")
        ).set_attr("id", "track_register"));
    }

    page.set_title("Fruit Login");
    page.add_javascripts("/public/javascripts/tracker.js");
    res.send(page.to_html());
});

module.exports = router;