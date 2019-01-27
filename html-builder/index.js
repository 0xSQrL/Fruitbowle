const basic_elements = require('./basic_elements');
const form_elements = require('./form');
const adv_elements = require('./advanced_elements');

module.exports.default_thumbnail = "";
module.exports.default_title = "";
module.exports.default_description = "";

function HTMLDocument() {
    let title = module.exports.default_title;
    let description = module.exports.default_description;
    let thumbnailPath = module.exports.default_thumbnail;
    let stylesheets = [];
    let javascripts = [];
    let contents = [];
    let bodyAttr = {};
    let requiresSecure = false;

    this.get_title = function () {
        return title;
    };
    this.set_title = function (new_title) {
        title = new_title;
    };
    this.get_description = function () {
        return description;
    };
    this.set_description = function (new_description) {
        description = new_description;
    };
    this.add_stylesheets = function (...style) {
        style.forEach(function (stl) {
            stylesheets.push(stl);
        });
    };
    this.add_javascripts = function (...java) {
        java.forEach(function (js) {
            javascripts.push(js);
        });
    };
    this.add_contents = function (...content) {
        content.forEach(function (cont) {
            contents.push(cont);
        });
    };

    this.set_attr = function (attr, value) {
        bodyAttr[attr] = value;
        return this;
    };
    this.to_html = function () {
        let htmldoc =
            `<html>
                    <head>
                        <meta charset="UTF-8">
                        <meta property="og:type" content="website">
                        <meta property="og:title" content="${title}" />
                        <meta property="og:description" content="${description}" />
                        <meta property="og:image" content="${thumbnailPath}" />
                        <title>${title}</title>`;
        stylesheets.forEach(function (style) {
            htmldoc += `<link rel="stylesheet" href="${style}">`
        });
        javascripts.forEach(function (js) {
            htmldoc += `<script src="${js}"></script>`
        });
        let attrStr = "";
        const attr = bodyAttr;
        Object.keys(attr).forEach(function(elem){
            attrStr += ` ${elem}="${attr[elem]}"`
        });
        htmldoc += `</head>
                    <body${attrStr}>`;

        contents.forEach(function (content) {

            if(content.to_html)
                htmldoc += content.to_html();
            else
                htmldoc += content;
        });
        htmldoc += `</body></html>`;
        return htmldoc;
    };

}


module.exports.HtmlBuilder = HTMLDocument;
module.exports.Elements = {...basic_elements, ...form_elements, ...adv_elements};