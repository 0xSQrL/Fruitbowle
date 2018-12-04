const express = require('express');
const router = express.Router();
const db = require.main.require('./../database');
const tracker_utils = require.main.require('./../utils/tracker');

router.post('/register', async function (req, res) {
    let pin = req.body.pin;
    if (!/[0-9][0-9][0-9][0-9]/.test(pin))
        return res.status(406).json({
            error: "Pin code invalid"
        });
    try {
        await db.one('INSERT INTO TrackerInfo (user_id, pin) VALUES ($1, $2) RETURNING (user_id, pin)', [req.user.id, pin]);
        return res.status(201).json({
            success: true
        });
    } catch (e) {
        return res.status(200).json({
            success: false
        })
    }
});



router.get('/checkon', async function (req, res) {
    let viewUser = req.query.user ? req.query.user : req.user.id;
    let viewUserId = await tracker_utils.getUserTrackerIdIfPerm(req.user.id, viewUser);

    if (!viewUserId)
        if (viewUser === req.user.id)
            return res.status(401).json({error: "you do not have a tracker account"});
        else
            return res.status(401).json({error: "no view permissions"});

    let status = await tracker_utils.get_user_status(viewUserId);
    return res.status(200).json({
        status
    });
});

router.get('/tracking', async function (req, res) {

    let tracking = await db.manyOrNone('SELECT * FROM TrackerUserViewPermissions WHERE tracker_user_id=$1', [req.user.id]);

    return res.status(200).json(tracking);
});

router.post('/tracking', async function (req, res) {

    try {
        let viewUser = req.body.username;

        let viewUserId = (await db.one("SELECT tracker_id FROM TrackerUser WHERE LOWER(username)=LOWER($1)", [viewUser])).tracker_id;

        let tracking = await db.one('INSERT INTO TrackerObserver (tracker_id, tracked_id) VALUES ($1,$2) RETURNING tracker_id, tracked_id', [req.user.id, viewUserId]);

        return res.status(200).json(tracking);
    }catch (e){
        console.log(e);
    }
});


router.get('/trackedby', async function (req, res) {

    let tracking = await db.manyOrNone('SELECT * FROM TrackerUserViewPermissions WHERE tracked_user_id=$1', [req.user.id]);

    return res.status(200).json(tracking);
});

router.put('/trackedby', async function (req, res) {

    let viewUser = req.body.tracker_id;
    let approval = req.body.approval;

    let viewUserId = (await db.one("SELECT id FROM TrackerInfo WHERE user_id=$1", [req.user.id])).id;

    let tracking = await db.one('UPDATE TrackerObserver SET approved=$3 WHERE tracker_id=$1 AND tracked_id=$2 RETURNING id, tracker_id, tracked_id, approved', [viewUserId, viewUser, approval]);

    return res.status(200).json(tracking);
});

router.get('/checkonhistory', async function(req, res){
    let viewUser = req.query.user ? req.query.user : req.user.id;
    let viewUserId = await tracker_utils.getUserTrackerIdIfPerm(req.user.id, viewUser);

    if (!viewUserId)
        return res.status(401).json({error: "no view permissions"});

    if((await tracker_utils.get_user_status(viewUserId)).status <= 0){
        return res.json([]);
    }

    let checkin_history = await db.manyOrNone('SELECT latitude, longitude, battery_percent, status, time_made FROM TrackerLog WHERE tracked_id=$1 ORDER BY time_made DESC LIMIT 10', [viewUserId]);

    return res.json(checkin_history);


});

router.post('/checkin', async function (req, res) {

    let userLast = await db.one('SELECT * FROM TrackerUser WHERE user_id=$1', [req.user.id]);
    let status = (await tracker_utils.get_user_status(userLast.tracker_id)).status;
    console.log(status);
    if (req.body.status < status) {
        let pin = req.body.pin;
        if (!(/^[0-9][0-9][0-9][0-9]$/.test(pin))){
         //pin invalid
        }else if (pin === userLast.pin) {
            status = req.body.status;
        }
    } else {
        status = req.body.status;
    }
    try {
        let logAddition = await db.one('INSERT INTO TrackerLog (tracked_id, status, latitude, longitude, battery_percent) VALUES ($1, $2, $3, $4, $5) RETURNING status, latitude, longitude, time_made, battery_percent', [userLast.tracker_id, status, req.body.latitude, req.body.longitude, req.body.battery_percent]);
        return res.status(201).json(logAddition);
    } catch (e) {
        return res.status(200).json({
            success: false
        })
    }
});


router.post('/schedule', async function (req, res) {

    let userLast = await db.one('SELECT * FROM TrackerUser WHERE user_id=$1', [req.user.id]);
    try {
        let logAddition = await db.one('INSERT INTO TrackerCheckin (tracked_id, time, plus_time, minus_time, on_days) VALUES ($1, $2, $3, $4, $5) RETURNING id, time, plus_time, minus_time, on_days', [userLast.tracker_id, req.body.time, req.body.plus_time, req.body.minus_time, req.body.on_days]);
        return res.status(201).json(logAddition);
    } catch (e) {
        return res.status(200).json({
            success: false
        })
    }
});


router.put('/schedule', async function (req, res) {

    let userLast = await db.one('SELECT * FROM TrackerUser WHERE user_id=$1', [req.user.id]);
    const scheduleId = req.body.schedule_id;
    try {
        let logAddition = await db.one('Update TrackerCheckin SET time=$1, plus_time=$2, minus_time=$3, on_days=$4 WHERE tracked_id=$5 AND id=$6 RETURNING id, time, plus_time, minus_time, on_days', [req.body.time, req.body.plus_time, req.body.minus_time, req.body.on_days, userLast.tracker_id, scheduleId]);
        return res.status(202).json(logAddition);
    } catch (e) {
        return res.status(200).json({
            success: false
        })
    }
});


router.delete('/schedule', async function (req, res) {

    let userLast = await db.one('SELECT * FROM TrackerUser WHERE user_id=$1', [req.user.id]);
    const scheduleId = req.body.schedule_id;
    try {
        let logAddition = await db.one('DELETE FROM TrackerCheckin WHERE tracked_id=$1 AND id=$2', [userLast.tracker_id, scheduleId]);
        return res.status(203).json({success: true});
    } catch (e) {
        return res.status(200).json({
            success: false
        })
    }
});

router.get('/schedule', async function (req, res) {
    let viewUser = req.query.user ? req.query.user : req.user.id;
    let viewUserId = await tracker_utils.getUserTrackerIdIfPerm(req.user.id, viewUser);

    if (!viewUserId)
        return res.status(401).json({error: "no view permissions"});

    let checkins = await db.manyOrNone('SELECT id, time, plus_time, minus_time, on_days FROM TrackerCheckin WHERE tracked_id=$1', [viewUserId]);
    return res.status(200).json(checkins);
});



/**

 DROP TABLE IF EXISTS TrackerInfo CASCADE;
 DROP TABLE IF EXISTS TrackerObserver CASCADE;
 DROP TABLE IF EXISTS TrackerLog CASCADE;
 DROP TABLE IF EXISTS TrackerCheckin CASCADE;
 DROP VIEW  IF EXISTS TrackerUser CASCADE;
 DROP VIEW  IF EXISTS TrackerUserLog CASCADE;
 DROP VIEW  IF EXISTS TrackerUserSchedule CASCADE;
 DROP VIEW  IF EXISTS TrackerUserViewPermissions CASCADE;

 CREATE TABLE TrackerInfo(
 id      SERIAL PRIMARY KEY,
 user_id  INTEGER references users(id) UNIQUE NOT NULL,
 pin     CHAR(4) NOT NULL
 );

 CREATE TABLE TrackerObserver(
 id           SERIAL PRIMARY KEY,
 tracked_id    INTEGER REFERENCES TrackerInfo(id) NOT NULL,
 tracker_id    INTEGER REFERENCES users(id) NOT NULL,
 approved     BOOLEAN DEFAULT NULL,
 CONSTRAINT one_for_one UNIQUE(tracker_id, tracked_id)
 );

 CREATE TABLE TrackerLog(
 id              SERIAL PRIMARY KEY,
 tracked_id       INTEGER REFERENCES TrackerInfo(id) NOT NULL,
 latitude        DECIMAL(8,5) NOT NULL,
 longitude       DECIMAL(8,5) NOT NULL,
 time_made       timestamp NOT NULL DEFAULT NOW(),
 battery_percent  DECIMAL(3,2),
 status          smallint
 );

 CREATE TABLE TrackerCheckin(
 id              SERIAL PRIMARY KEY,
 tracked_id       INTEGER REFERENCES TrackerInfo(id) NOT NULL,
 time            TIME NOT NULL,
 plus_time       TIME NOT NULL,
 minus_time      TIME NOT NULL,
 on_days         BOOLEAN[7] DEFAULT '{T,T,T,T,T,T,T}'
 );

 CREATE VIEW TrackerUser AS
 (SELECT users.id as user_id, users.username, TrackerInfo.id as tracker_id, TrackerInfo.pin FROM users join TrackerInfo on users.id=TrackerInfo.user_id);

 CREATE VIEW TrackerUserLog AS
 (SELECT users.id as user_id, TrackerInfo.id as tracker_id, TrackerLog.time_made, TrackerLog.status, TrackerLog.latitude, TrackerLog.longitude, TrackerLog.battery_percent FROM users join TrackerInfo on users.id=TrackerInfo.user_id join TrackerLog on TrackerInfo.id=TrackerLog.tracked_id);

 CREATE VIEW TrackerUserSchedule AS
 (SELECT users.id as user_id, TrackerInfo.id as tracker_id, TrackerCheckin.time, TrackerCheckin.plus_time, TrackerCheckin.minus_time, TrackerCheckin.on_days FROM users join TrackerInfo on users.id=TrackerInfo.user_id join TrackerCheckin on TrackerInfo.id=TrackerCheckin.tracked_id);

 CREATE VIEW TrackerUserViewPermissions AS
 (SELECT TrackerObserver.id, TrackerUser.user_id as tracked_user_id, TrackerUser.username as tracked_username, TrackerUser.tracker_id as tracked_tracker_id, users.id as tracker_user_id, users.username as tracker_username, approved FROM users join TrackerObserver on users.id=TrackerObserver.tracker_id join TrackerUser on TrackerObserver.tracked_id=TrackerUser.tracker_id);

 */

module.exports = router;