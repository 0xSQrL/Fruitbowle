module.exports.SimpleBreak = `<br>`;

module.exports.BasicContent = function (tag) {

    this.attributes = {};
    this.tag = tag;
};
module.exports.BasicContent.prototype.to_html = function(){
    let attrStr = "";
    const attr = this.attributes;
    Object.keys(attr).forEach(function(elem){
        attrStr += ` ${elem}="${attr[elem]}"`
    });
    return `<${this.tag}${attrStr}>`;
};
module.exports.BasicContent.prototype.set_attr = function (attr, value) {
    this.attributes[attr] = value;
    return this;
};

module.exports.BasicContainer = function (tag, ...content) {
    module.exports.BasicContent.call(this, tag);
    this.contents = content;
};
module.exports.BasicContainer.prototype = Object.create(module.exports.BasicContent.prototype);
module.exports.BasicContainer.prototype.constructor = module.exports.BasicContainer;
module.exports.BasicContainer.prototype.add_contents = function (...content) {
    const this_cont = this.contents;
    content.forEach(function (cont) {
        this_cont.push(cont);
    });
    return this;
};
module.exports.BasicContainer.prototype.to_html = function(){
    let attrStr = "";
    const attr = this.attributes;
    Object.keys(attr).forEach(function(elem){
        attrStr += ` ${elem}="${attr[elem]}"`
    });
    let cont = "";
    this.contents.forEach(function (content) {
        if(content.to_html)
            cont += content.to_html();
        else
            cont += content;
    });

    return `<${this.tag}${attrStr}>${cont}</${this.tag}>`;
};

module.exports.Divider = function (...content) {
    module.exports.BasicContainer.call(this, "div", ...content);
};
module.exports.Divider.prototype = Object.create(module.exports.BasicContainer.prototype);
module.exports.Divider.prototype.constructor = module.exports.Divider;

module.exports.Span = function (...content) {
    module.exports.BasicContainer.call(this, "span", ...content);
};
module.exports.Span.prototype = Object.create(module.exports.BasicContainer.prototype);
module.exports.Span.prototype.constructor = module.exports.Span;


module.exports.Center = function (...content) {
    module.exports.BasicContainer.call(this, "center", ...content);
};
module.exports.Center.prototype = Object.create(module.exports.BasicContainer.prototype);
module.exports.Center.prototype.constructor = module.exports.Center;

module.exports.Link = function (link, ...content) {
    module.exports.BasicContainer.call(this, "a", ...content);
    this.set_attr("href", link);
};
module.exports.Link.prototype = Object.create(module.exports.BasicContainer.prototype);
module.exports.Link.prototype.constructor = module.exports.Link;

module.exports.Heading = function (size, ...content) {
    module.exports.BasicContainer.call(this, `h${size}`, ...content);
};
module.exports.Heading.prototype = Object.create(module.exports.BasicContainer.prototype);
module.exports.Heading.prototype.constructor = module.exports.Heading;


module.exports.Image = function (src, alt_text) {
    module.exports.BasicContent.call(this, `img`);
    this.set_attr("src", src);
    if (alt_text)
        this.set_attr("alt", alt_text);
};
module.exports.Image.prototype = Object.create(module.exports.BasicContent.prototype);
module.exports.Image.prototype.constructor = module.exports.Image;

module.exports.Break = function (repeats) {
    if(!repeats)
        repeats = 1;
    let breaks = "";
    for(let i = 0; i < repeats; i++)
        breaks += "<br>"
    return breaks;
};

module.exports.Spacing = function (repeats) {
    if(!repeats)
        repeats = 1;
    let spaces = "";
    for(let i = 0; i < repeats; i++)
        spaces += "&nbsp"
    return spaces;
};