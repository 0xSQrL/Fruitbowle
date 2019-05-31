const express = require('express');
const html_builder = require('../html-builder');
const web_components = require('./web_components');
const db = require.main.require('./../database');
const Elements = html_builder.Elements;
const login_fe = require('./login');
const tracking_fe = require('./tracking');


const router = express.Router();

router.use('/login', login_fe);

router.use('/tracker', tracking_fe);

router.get('/', (req, res) => {
try {
    let page = web_components.standardPage(req.user,
        new Elements.Subpage('private/page-segments/landing-page.html')
    );
    page.set_title("Fruit Bowl Home!");
    res.send(page.to_html());
}catch (e){
    console.log(e);
}
});

module.exports = router;