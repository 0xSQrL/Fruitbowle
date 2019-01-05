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
        new Elements.Center(
            new Elements.Heading(2, "Welcome to Fruit Bowl E(ntertainment)"),
            new Elements.Heading(3, "The plaid clad website")
        ),
        "This website is still under construction, please excuse our dust.", Elements.Break,
        new Elements.Link('/tracker', 'Tracker')
    );
    page.set_title("Fruit Bowl Home!");
    res.send(page.to_html());
}catch (e){
    console.log(e);
}
});

module.exports = router;