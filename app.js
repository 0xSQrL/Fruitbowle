const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('express-jwt');

const jsonwebtoken = require('jsonwebtoken');
const html_builder = require('./html-builder');


const db = require('./database');
const mail = require('./mailer');
const apiRouter = require('./api-routes');
const frontedRouter = require('./frontend-routes');
const rtsgame = require('./RTSGame');

const app = express();

html_builder.default_thumbnail = "/public/images/CoffeeSquirrel.jpg";
html_builder.default_title = "Fruit Bowl Entertainment";
html_builder.default_description = "Fruit Bowl Entertainment is a website that does stuff.";
// view engine setup

app.use(express.json());
app.use(cookieParser());
app.use('/public', express.static('./public'));

app.use(function(req, res, next) {
    if(req.cookies['token']) {
        req.headers['authorization'] = "BEARER " + req.cookies['token'];
        jsonwebtoken.verify(req.cookies['token'], process.env.JWT_SECRET, function(err, token){
            if(err){

            }else{

                req.user = jsonwebtoken.decode(req.cookies['token']);
            }
        });
    }
    next();
});

app.use(jwt({ secret: process.env.JWT_SECRET }).unless({ path: [
        '/api',
        /\/api\/users*/,
        /\/public*/,
        "/",
        /\/login*/
    ]}));

app.use((jwt_error, request, response, next) => {
    if (jwt_error.name === 'UnauthorizedError') {
        return response.status(401).send("Not logged in");
    }
    next();
});


app.use("/api", apiRouter);
app.use("/", frontedRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).send('error');
});

module.exports = app;
