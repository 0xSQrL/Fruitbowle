const db = require.main.require('./../database');


async function getUserTrackerId(user) {
	const tracker = await db.oneOrNone("SELECT id FROM TrackerInfo WHERE user_id=$1", [user]);
	if(tracker)
    	return tracker.id;
	return null;
}

async function getUserTrackerIdIfPerm (user, viewUser){
    try {
        let viewUserId = (await db.one("SELECT id FROM TrackerInfo WHERE user_id=$1", [viewUser])).id;

        let viewPerms = await db.oneOrNone('SELECT * FROM TrackerUserViewPermissions WHERE tracker_user_id=$1 AND tracked_tracker_id=$2 AND approved=true', [user, viewUserId]);
        if (!viewPerms && viewUser !== user)
            return false;
        return viewUserId;
    }catch (e) {
        return false;
    }
};



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

function get_time_as_millis(time) {
    return new Date(`Jan 1 1970 ${time} UTC`).getTime();
}

module.exports = {get_user_status, is_time_pass_schedule, getUserTrackerIdIfPerm, getUserTrackerId};