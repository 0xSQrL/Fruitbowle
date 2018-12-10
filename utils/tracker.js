const db = require.main.require('./../database');


function user_status_to_string(val){
	switch (val) {
		case 0: return 'Ok';
		case 1: return 'Not Checked in';
		case 2: return 'Nervous';
		case 3: return 'Danger';
		default: return 'Undefined';
	}
}

async function getUserTrackerId(user) {
	const tracker = await db.oneOrNone("SELECT id FROM TrackerInfo WHERE user_id=$1", [user]);
	if(tracker)
    	return tracker.id;
	return null;
}

function locationToDMS(coord){
	const degree = Math.floor(coord);
	coord = (coord-degree) * 60;
	const minutes = Math.floor(coord);
	coord = (coord-degree) * 600;
	const seconds = Math.floor(coord) / 10;
	return `${degree}°${minutes}'${seconds}"`;
}

async function get_tracking_requests(user){
	return (await db.manyOrNone('SELECT tracked_username, tracker_username, approved, tracker_user_id FROM TrackerUserViewPermissions WHERE tracked_user_id=$1', [user]))
}

async function get_tracker_requests(user){
	return (await db.manyOrNone('SELECT tracked_username, tracker_username, approved, tracked_user_id FROM TrackerUserViewPermissions WHERE tracker_user_id=$1', [user]));
}

async function getUserTrackerIfPerm (user, viewUser){
	const oriUser = viewUser;
    try {
        viewUser = (await db.one("SELECT tracker_id, username, user_id FROM TrackerUser WHERE user_id=$1", [viewUser]));
        viewUser.id = viewUser.tracker_id;
        let viewPerms = await db.oneOrNone('SELECT 1 FROM TrackerUserViewPermissions WHERE tracker_user_id=$1 AND tracked_tracker_id=$2 AND approved=true', [user, viewUser.id]);
        if (!viewPerms && viewUser.user_id !== user)
            return false;
        return viewUser;
    }catch (e) {
		return (user === oriUser);
    }
}

async function get_checkin_history(trackedUser){
	let checkin_history = await db.manyOrNone('SELECT latitude, longitude, battery_percent, status, time_made FROM TrackerLog WHERE tracked_id=$1 ORDER BY time_made DESC LIMIT 10', [trackedUser.id]);
	return checkin_history ? checkin_history : [];
}


async function get_checkin_schedule(trackedUser){
	let checkins = await db.manyOrNone('SELECT id, time, plus_time, minus_time, on_days FROM TrackerCheckin WHERE tracked_id=$1 ORDER BY time ASC', [trackedUser.id]);
	return checkins ? checkins : [];
}




async function get_user_status(user_id) {
    let userLast = await db.oneOrNone("SELECT * FROM TrackerUserLog WHERE tracker_id=$1 AND STATUS<>1 ORDER BY time_made DESC LIMIT 1", [user_id]);
    let stat = {time: userLast ? userLast.time_made : null, battery_percent: userLast ? userLast.battery_percent : null, status: 0};
    if (!userLast) {
        userLast = {status: 0, time_made: (new Date(Date.now() - 7 * 24 * 3600 * 1000))};
    }
    if (userLast.status > 0) {
        stat.status = userLast.status;
        return stat;
    }

    let userSchedule = await db.manyOrNone("SELECT * FROM TrackerUserSchedule WHERE tracker_id=$1", [user_id]);
    for (let i = 0; i < userSchedule.length; i++) {
        const curSched = userSchedule[i];
        if (is_time_pass_schedule(userLast.time_made, curSched) === 1) {

            stat.status = 1;
            return stat;

        }
    }
    return stat;
}

function is_time_pass_schedule(time, schedule) {
    let timezone = time.getTimezoneOffset();
    timezone = `${timezone > 0 ? '-' : '+'}${Math.floor(timezone/60)}:${timezone%60}`;
    let testTime = new Date(`${time.toDateString()} ${schedule.time} ${timezone}`);
    while (testTime.getTime() < Date.now()) {
        if (schedule.on_days[testTime.getDay()]) {
            let diff = get_time_relative(time, testTime, schedule.minus_time, schedule.plus_time);
            let diffNow = get_time_relative(new Date(), testTime, schedule.minus_time, schedule.plus_time);
            if (diff === -1 && diffNow > -1)
                return diffNow;
        }
        testTime = new Date(testTime.getTime() + 24 * 60 * 60 * 1000);
    }
    return -1;
}

function get_time_relative(time, check_time, prebuffer, postbuffer) {
	let premillis = check_time.getTime() - get_time_as_millis(prebuffer);
	let postmillis = check_time.getTime() + get_time_as_millis(postbuffer);
	if (time.getTime() > postmillis)
		return 1;
	if (time.getTime() > premillis)
		return 0;
	return -1;
}


function get_time_between(check_time, prebuffer, postbuffer) {
	let premillis = new Date(check_time.getTime() - get_time_as_millis(prebuffer));
	let postmillis = new Date(check_time.getTime() + get_time_as_millis(postbuffer));

	return `${premillis.getHours()}:${premillis.getMinutes()} - ${postmillis.getHours()}:${postmillis.getMinutes()}`;
}

function alert_user_trackers(user_id, latitude, longitude){

}

function get_time_as_millis(time) {
    return new Date(`Jan 1 1970 ${time} UTC`).getTime();
}

module.exports = {
	get_user_status,
	is_time_pass_schedule,
	get_checkin_history,
	get_checkin_schedule,
	get_time_between,
	getUserTrackerIfPerm,
	getUserTrackerId,
	user_status_to_string,
	get_tracking_requests,
	get_tracker_requests,
	alert_user_trackers
};