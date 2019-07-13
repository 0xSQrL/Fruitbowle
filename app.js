const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const jwt = require('express-jwt');
const fileUpload = require('express-fileupload');

const jsonwebtoken = require('jsonwebtoken');
const html_builder = require('./html-builder');
const web_components = require('./frontend-routes/web_components');
const Elements = html_builder.Elements;


const db = require('./database');
const mail = require('./mailer');
const apiRouter = require('./api-routes');
const frontedRouter = require('./frontend-routes');
const rtsgame = require('./RTSGame');



const app = express();

html_builder.default_thumbnail = "/public/images/CoffeeSquirrel.jpg";
html_builder.default_title = "Fruit Bowl Entertainment";
html_builder.default_description = "Fruit Bowl Entertainment is a website that does stuff. ¯\\_(ツ)_/¯";
// view engine setup

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
	limits: {fileSize: 50 * 1024 *  1024 /* 50 MB */},
	abortOnLimit: true,
}));
app.use('/public', express.static('./public'));
app.use('/', express.static('./public/pages'));
app.use('/favicon.ico', express.static('./public/images/favicon.ico'));

app.use(function(req, res, next) {
    if(req.cookies['token']) {
        jsonwebtoken.verify(req.cookies['token'], process.env.JWT_SECRET, async function(err, token){
            if(err){

            }else{

                let tmpUser = jsonwebtoken.decode(req.cookies['token']);
                let validation = await db.oneOrNone("SELECT id, username, is_validated, last_password_change FROM users WHERE id=$1", [tmpUser.id]);
                if(validation && validation.is_validated && new Date(tmpUser.last_password_change).getTime() === validation.last_password_change.getTime()) {
					req.user = tmpUser;
				}

			}

			next();
        });
    }else{
		next();
	}
});

app.use(function (req, res, next) {
	const exceptions = [
		'/api',
		'/api/rebuild_dbs',
		/^\/api\/users*/,
		///\/api\/java*/,
		/^\/public*/,
		/^\/blog*/,
		/^\/api\/blog*/,
		/^\/api\/banned-food*/,
		"/",
		/^\/login*/,
		//'/ide'
	];
	if(req.user)
		return next();
	let excepted = false;
	exceptions.forEach(exception =>{
		if(exception instanceof RegExp){
			if(exception.test(req.path))
				excepted = true;
		}else{
			if(exception === req.path)
				excepted = true;
		}
	});
	if(excepted)
		return next();


	const page = web_components.standardPage(
		null, new Elements.Center(new Elements.Heading(2, "Not logged in"))
	);
	return res.status(401).send(page.to_html());

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
  const status = err.status || 500;
	const page = web_components.standardPage(
		req.user, new Elements.Subpage('private/page-segments/errors/GenericError.html').add_substitution('<status/>', status).add_substitution('<multibreak/>', Elements.Break(10))
	);
  // render the error page
  res.status(status).send(page.to_html());
});

module.exports = app;
