const html_builder = require.main.require('../html-builder');
const escape = require('escape-html');
module.exports.escape = escape;
const Elements = html_builder.Elements;

module.exports.topbar = function (user) {

	let user_management = new Elements.Divider();
    if(user){
        user_management.add_contents(
            `Welcome ${escape(user.username)}! `,
            new Elements.Link('', "Log out").set_attr("onClick", "return clearToken()").set_attr("class", "login")
        );
    }else{
        user_management.add_contents(
            new Elements.Link("/login", "Log in").set_attr("class", "login"),
            " or ", new Elements.Link("/login/register", "create a new account").set_attr("class", "login")
        );
    }
    user_management.set_attr("class", "user_management");
	let topbarTemplate = new Elements.Subpage("private/page-segments/global/Topbar.html");
	topbarTemplate.add_substitution("<user-management/>", user_management.to_html());
    return topbarTemplate;
};

module.exports.standardPage = function(user, ...content){

    const headbar = module.exports.topbar(user);
    let page = new html_builder.HtmlBuilder();

    page.add_stylesheets("/public/stylesheets/style.css");
    page.add_javascripts("/public/javascripts/jquery-3.3.1.min.js");
    page.add_javascripts("/public/javascripts/basic_utils.js");

	let mainContent = new Elements.Divider(
		...content
	).set_attr("class", "content");
    page.add_contents(headbar);
    page.add_contents(mainContent);
    page.add_contents = function (...content) {
		content.forEach(function (cont) {
			mainContent.add_contents(cont);
		});
		return this;
	};
    return page;
};


module.exports.force_ssl = function(req, res){

	if(!req.secure && process.env.SECURE_PORT) {
		res.redirect(`https://${process.env.DOMAIN}${req.originalUrl}`);
		return true;
	}
	return false;

};