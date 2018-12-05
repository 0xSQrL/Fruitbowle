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
    	let user_status = await tracker_utils.get_user_status(tracker_id);
    	console.log(user_status);
        page.add_contents(
			new Elements.Center(new Elements.Heading(2, "Welcome back to Fruit Bowl Tracker")),
			`Your current status: ${tracker_utils.user_status_to_string(user_status.status)}`,
			Elements.SimpleBreak
		);
        page.add_contents(new Elements.Heading(3, `Tracking Requests`));
		let requests = await tracker_utils.get_tracking_requests(req.user.id);
		if(requests) {
			let requestsObj = [];
			for (let i = 0; i < requests.length; i++) {
				let approval;
				if (requests[i].approved) {
					approval = `<a onclick="tracker_reject(${requests[i].tracker_user_id}})">Reject</a>`
				} else {
					approval = `<a onclick="tracker_approve(${requests[i].tracker_user_id}})">Approve</a>`
				}


				requestsObj.push([requests[i].tracker_username, approval])
			}
		}else{
			page.add_contents("No trackers");
		}

    }else{
        page.add_contents(
        	new Elements.Center(new Elements.Heading(2, "Welcome to Fruit Bowl Tracker")),
        	new Elements.Form(
				"4-Digit PIN Number", Elements.SimpleBreak,
				new Elements.Form.PasswordField("pin").set_attr("maxLength", 4).set_attr('onkeypress', 'force_only_number(this)'),
				new Elements.Span().set_attr("id", "pinError").set_attr("class", "error"),
				Elements.SimpleBreak,
				new Elements.Form.SubmitButton("Create Tracker Account").set_attr("onClick", "return send_create_tracker_request()")
			).set_attr("id", "track_register")
		);
    }

    page.add_contents(new Elements.Heading(3, `Tracking Requests`));
	let requests = await tracker_utils.get_tracker_requests(req.user.id);
	if(requests) {
		let requestsObj = [];
		for (let i = 0; i < requests.length; i++) {
			let approval = new Elements.Span(requests[i].tracked_username);
			if (requests[i].approved) {
				approval = new Elements.Link(`/tracker/user?=${requests[i].tracked_user_id}`, approval);
			} else {
				approval = approval.add_contents(`awaiting approval`);
			}


			requestsObj.push([approval]);
		}
		page.add_contents(new Elements.Table("tracked", requestsObj));
	}else{
		page.add_contents("No trackers");
	}
	page.add_contents(Elements.SimpleBreak,Elements.SimpleBreak, "Request tracking permissions from User", Elements.SimpleBreak,
		new Elements.Form(new Elements.Form.TextField("username"), new Elements.Form.SubmitButton("request").set_attr('onClick', 'return user_request()')));

    page.set_title("Fruit Login");
    page.add_javascripts("/public/javascripts/tracker.js");
    res.send(page.to_html());
});

module.exports = router;