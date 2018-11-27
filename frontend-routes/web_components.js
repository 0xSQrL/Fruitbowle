const html_builder = require.main.require('../html-builder');
const Elements = html_builder.Elements;

module.exports.topbar = function (user) {
    const logo = new Elements.Link("/",
        new Elements.Image("/public/images/CoffeeSquirrel.png").set_attr("class", "top_icon"),
        new Elements.Span("Fruit Bowl Entertainment").set_attr("class", "logo_text")
    ).set_attr("class", "ignorant");
    let user_management = new Elements.Divider();
    if(user){
        user_management.add_contents(
            `Welcome ${user.username}! `,
            new Elements.Link('', "Log out").set_attr("onClick", "clearToken()").set_attr("class", "login")
        );
    }else{
        user_management.add_contents(
            new Elements.Link("/login", "Log in").set_attr("class", "login"),
            " or ", new Elements.Link("/login/register", "create a new account").set_attr("class", "login")
        );
    }
    user_management.set_attr("class", "user_management");

    return new Elements.Span(
        new Elements.Divider(logo, user_management).set_attr("class", "headbar"),
        new Elements.Divider().set_attr("class", "divider")
    );
};

module.exports.standardPage = function(user, ...content){

    const headbar = module.exports.topbar(user);
    let page = new html_builder.HtmlBuilder();

    page.add_stylesheets("/public/stylesheets/style.css");
    page.add_javascripts("/public/javascripts/jquery-3.3.1.min.js");
    page.add_javascripts("/public/javascripts/basic_utils.js");

    page.add_contents(headbar);
    page.add_contents(
        new Elements.Divider(
            ...content
        ).set_attr("class", "content")
    );
    return page;
};