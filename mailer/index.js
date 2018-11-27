const mail = require('nodemailer');

const email_address = process.env.EMAIL_ADDRESS;

module.exports.transport = mail.createTransport({
	service: process.env.EMAIL_SERVICE,
	auth: {
		user: email_address,
		pass: process.env.EMAIL_PASSWORD
	}
});

module.exports.send_mail = function (to_address, subject, body, onSuccess, onFail) {
	const mailStruct = {from: email_address, to: to_address, subject: subject, html: body};
	module.exports.transport.sendMail(mailStruct, function (error, info) {
		if(error){
			if(onFail)
				onFail(error);
		}else{
			if(onSuccess)
				onSuccess(info);
		}
	})
};