const express = require('express');
const filesystem = require('fs');
const users = require('./users');
const tracking = require('./tracking');
const java = require('./java_compiler');

const router = express.Router();


router.get('/', (request, response) => {
    filesystem.readFile('./api-routes/Access.html', 'utf8', function (err, contents) {
        response.send(contents);
    });
});

router.use('/users', users);

router.use('/tracker', tracking);





module.exports = router;
