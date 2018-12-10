const html_builder = require.main.require('../html-builder');
const web_components = require('./web_components');
const Elements = html_builder.Elements;
const tracker_utils = require.main.require('./../utils/tracker');

const express = require('express');
const router = express.Router();

function PIN_Field() {
	return new Elements.Form.PasswordField("pin").set_attr("maxLength", 4).set_attr('onkeypress', 'force_only_number(this)');
}

function create_tracking_account_form(page) {
	page.add_contents(
		new Elements.Center(new Elements.Heading(2, "Welcome to Fruit Bowl Tracker")),
		new Elements.Form(
			"4-Digit PIN Number", Elements.SimpleBreak,
			PIN_Field(),
			new Elements.Span().set_attr("id", "pinError").set_attr("class", "error"),
			Elements.SimpleBreak,
			new Elements.Form.SubmitButton("Create Tracker Account").set_attr("onClick", "return send_create_tracker_request()")
		).set_attr("id", "track_register")
	);
}

async function generate_trackers_table(page, user) {

	page.add_contents(new Elements.Heading(3, `Tracker Requests`));
	let requests = await tracker_utils.get_tracking_requests(user.id);
	if (requests && requests.length > 0) {
		let requestsObj = [];
		for (let i = 0; i < requests.length; i++) {
			let approval;
			if (requests[i].approved) {
				approval = `Approved <a href="" onclick="return tracker_reject(${requests[i].tracker_user_id})">Reject</a>`
			} else {
				approval = `<a href="" onclick="return tracker_approve(${requests[i].tracker_user_id})">Approve</a> <a href="" onclick="return tracker_reject(${requests[i].tracker_user_id})">Reject</a>`
			}


			requestsObj.push([requests[i].tracker_username, approval]);
		}
		page.add_contents(new Elements.Table("tracked", requestsObj));
	} else {
		page.add_contents("No trackers");
	}
}


function locationToDMS(coord, northSouth){
	coord = Math.abs(coord);
	let orientation = '';
	if(typeof northSouth !== 'undefined')
		if(northSouth)
			orientation = coord > 0 ? 'N' : 'S';
		else
			orientation = coord > 0 ? 'W' : 'E';
	const degree = Math.floor(coord);
	coord = (coord-degree) * 60;
	const minutes = Math.floor(coord);
	coord = (coord-minutes) * 600;
	const seconds = Math.floor(coord) / 10;
	return `${degree}°${minutes}'${seconds}&quot;${orientation}`;
}

async function generate_users_histroy_table(page, user, target_user) {
	let user_history = await tracker_utils.get_checkin_history(target_user);
	if (user_history.length > 0) {
		let historyObj = [['Time', 'Battery', 'Status', 'Location']];
		for (let i = 0; i < user_history.length; i++) {
			let batteryPercent = user_history[i].battery_percent >= 0 ? user_history[i].battery_percent : 'N/A';
			let status = tracker_utils.user_status_to_string(user_history[i].status);
			let locationLink = new Elements.Link(
				`https://www.google.com/maps/place/${locationToDMS(user_history[i].latitude, true)}+${locationToDMS(user_history[i].longitude, false)}`,
				`${locationToDMS(user_history[i].latitude, true)}, ${locationToDMS(user_history[i].longitude, false)}`);
			historyObj.push([user_history[i].time_made, batteryPercent, status, locationLink]);
		}
		page.add_contents(new Elements.Table("history", historyObj, true));
	}
}


async function generate_users_checkin_table(page, user, target_user) {
	let user_schedule = await tracker_utils.get_checkin_schedule(target_user);
	page.add_contents(new Elements.Heading(3,"Check In Schedule"));

	const nowdate = new Date();
	page.add_contents(`Current Server Time: ${nowdate.getHours()}:${nowdate.getMinutes()}`);
	const time = new Date();
	if (user_schedule.length > 0) {
		let historyObj = [['Sunday'], ['Monday'], ['Tuesday'], ['Wednesday'], ['Thursday'], ['Friday'], ['Saturday']];
		for (let i = 0; i < user_schedule.length; i++) {

			let testTime = new Date(`${time.toDateString()} ${user_schedule[i].time} EST`);
			const timer = tracker_utils.get_time_between(testTime, user_schedule[i].minus_time, user_schedule[i].plus_time);
			for (let j = 0; j < 7; j++) {
				if (user_schedule[i].on_days[j])
					historyObj[j].push(timer);
				else
					historyObj[j].push('');
			}
		}
		for (let j = 0; j < 7; j++) {
				historyObj[j].push('');
		}
		page.add_contents(new Elements.Table("schedule", historyObj, false, function(obj,i){
				let styles = '';

				if(i % 2 === 1)
					obj.set_attr('style','background-color:rgba(0,0,0,0.1); height: 2em;');
				else
					obj.set_attr('style','height: 2em;');
			},
			function(obj,i, j){
				if(j === 0)
					obj.set_attr('style','font-weight:bold;');
			},

			function(obj,i){
				if(i < historyObj[0].length - 1)
					obj.set_attr('width','120px');
			}
			).set_attr('style', 'border-collapse: collapse; border: 2px solid rgba(0,0,0,0.1);width: 100%'));
	}
}

async function generate_tracking_table(page, user) {
	page.add_contents(new Elements.Heading(3, `Users Tracked`));
	let requests = await tracker_utils.get_tracker_requests(user.id);
	if (requests && requests.length > 0) {
		let requestsObj = [];
		for (let i = 0; i < requests.length; i++) {
			let approval = new Elements.Span(requests[i].tracked_username);
			if (requests[i].approved) {
				approval = new Elements.Link(`/tracker/user?user=${requests[i].tracked_user_id}`, approval);
			} else {
				approval = approval.add_contents(`awaiting approval`);
			}

			requestsObj.push([approval]);
		}
		page.add_contents(new Elements.Table("tracking", requestsObj));
	} else {
		page.add_contents("Tracking no users");
	}
}

function generate_user_checkin(page) {
	page.add_contents(new Elements.Form(
		new Elements.Table('ci', [
				[
					'Latitude', 'Longitude', '', 'PIN', ''
				],
					[
					new Elements.Form.TextField('latitude').set_attr('readonly'),
						new Elements.Form.TextField('longitude').set_attr('readonly'),
						new Elements.Form.TextField('battery_percent', '-1').set_attr('readonly').set_attr('hidden'),
						PIN_Field(),
						new Elements.Form.SubmitButton("Good").set_attr('id', 'goodCI').set_attr("onClick", "return send_check_in(0)").set_attr('disabled').set_attr('class', 'good'),
						new Elements.Form.SubmitButton("Nervous").set_attr('id', 'nervCI').set_attr("onClick", "return send_check_in(2)").set_attr('disabled').set_attr('class', 'nervous'),
						new Elements.Form.SubmitButton("Emergency").set_attr('id', 'emerCI').set_attr("onClick", "return send_check_in(3)").set_attr('disabled').set_attr('class', 'emergency')
					]
			]
		), Elements.SimpleBreak, new Elements.Span('<br>').set_attr('id', 'checkinStatus')
	).set_attr('id', 'checkInForm')).set_attr('onLoad','autoLocation()');
}

async function generate_user_status(page, user_id, tracker_id) {
	let user_status = await tracker_utils.get_user_status(tracker_id);
	console.log(user_status);
	page.add_contents(
		new Elements.Link(`/tracker/user?user=${user_id}`,
		`Your current status: `, new Elements.Span(tracker_utils.user_status_to_string(user_status.status)).set_attr('id', 'userStatus')),
		Elements.SimpleBreak
	);
}

router.get('/', async function (req, res) {

	let page = web_components.standardPage(req.user);
	let tracker_id;
	if (tracker_id = await tracker_utils.getUserTrackerId(req.user.id)) {
		page.add_contents(
			new Elements.Center(new Elements.Heading(2, "Welcome back to Fruit Bowl Tracker"))
		);
		await generate_user_status(page, req.user.id, tracker_id);
		generate_user_checkin(page);
		await generate_trackers_table(page, req.user);

	} else {
		create_tracking_account_form(page);
	}

	await generate_tracking_table(page, req.user);
	page.add_contents(Elements.SimpleBreak, Elements.SimpleBreak,
		new Elements.Form(
			"Request tracking permissions from User", Elements.SimpleBreak,
			new Elements.Form.TextField("username"),
			new Elements.Form.SubmitButton("request").set_attr('onClick', 'return user_request()'),
			Elements.SimpleBreak,
			new Elements.Span().set_attr('id', 'userRequestError').set_attr('class', 'error')
		).set_attr('id', 'track_request'));

	page.set_title("Fruit Login");
	page.add_javascripts("/public/javascripts/tracker.js");
	res.send(page.to_html());
});



router.get('/user', async function (req, res) {
	let targetUser = req.query.user;
	if(!targetUser)
		targetUser = req.user.id;
	let page = web_components.standardPage(req.user);
	let tracker;
	if (tracker = await tracker_utils.getUserTrackerIfPerm(req.user.id, targetUser)) {
		page.add_contents(new Elements.Center(new Elements.Heading('2', `Tracking ${web_components.escape(tracker.username)}`)));
		let user_status = await tracker_utils.get_user_status(tracker.id);
		page.add_contents(
			`${web_components.escape(tracker.username)}'s current status: `,
			new Elements.Span(tracker_utils.user_status_to_string(user_status.status)).set_attr('id', 'userStatus'), Elements.SimpleBreak, Elements.SimpleTab,
			`as of ${user_status.time}`,
			Elements.SimpleBreak
		);
		page.add_contents(Elements.Break(2));
		if(user_status.status > 0)
			await generate_users_histroy_table(page, req.user.id, tracker);
		await generate_users_checkin_table(page, req.user.id, tracker);
	}else{
		page.add_contents(new Elements.Center(new Elements.Heading('2', 'You do not have permission to view this user')))
	}
	page.set_title("Fruit Login");
	page.add_javascripts("/public/javascripts/tracker.js");
	res.send(page.to_html());
});

module.exports = router;