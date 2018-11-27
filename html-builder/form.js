const basics = require('./basic_elements');

module.exports.Form = function (...content) {
    basics.BasicContainer.call(this, `form`, ...content);
};
module.exports.Form.prototype = Object.create(basics.BasicContainer.prototype);
module.exports.Form.prototype.constructor = module.exports.Form;

module.exports.Form.TextField = function (name, default_text) {
    basics.BasicContent.call(this, `input`);
    this.set_attr("type", "text");
    if (default_text)
        this.set_attr("value", default_text);
    this.set_attr("name", name);
};
module.exports.Form.TextField.prototype = Object.create(basics.BasicContent.prototype);
module.exports.Form.TextField.prototype.constructor = module.exports.Form.TextField;

module.exports.Form.PasswordField = function (name, default_text) {
    basics.BasicContent.call(this, `input`);
    this.set_attr("type", "password");
    if (default_text)
        this.set_attr("value", default_text);
    this.set_attr("name", name);
};
module.exports.Form.PasswordField.prototype = Object.create(basics.BasicContent.prototype);
module.exports.Form.PasswordField.prototype.constructor = module.exports.Form.PasswordField;

module.exports.Form.SubmitButton = function (text) {
    basics.BasicContent.call(this, `input`);
    this.set_attr("type", "submit");
    if (text)
        this.set_attr("value", text);

};
module.exports.Form.SubmitButton.prototype = Object.create(basics.BasicContent.prototype);
module.exports.Form.SubmitButton.prototype.constructor = module.exports.Form.SubmitButton;

module.exports.Form.Select = function (name, ...values) {
    basics.BasicContainer.call(this, `select`, ...values);
    this.set_attr("name", name);
};
module.exports.Form.Select.prototype = Object.create(basics.BasicContainer.prototype);
module.exports.Form.Select.prototype.constructor = module.exports.Form.Select;

module.exports.Form.Select.Option = function (name, value) {
    basics.BasicContainer.call(this, `option`);
    this.contents.push(name);
    this.set_attr("value", value);
};
module.exports.Form.Select.Option.prototype = Object.create(basics.BasicContainer.prototype);
module.exports.Form.Select.Option.prototype.constructor = module.exports.Form.Select.Option;

module.exports.Form.CheckBox = function (group, value) {
    basics.BasicContent.call(this, `input`);
    this.set_attr("type", "checkbox");
    this.set_attr("name", group);
    this.set_attr("value", value);
};
module.exports.Form.CheckBox.prototype = Object.create(basics.BasicContent.prototype);
module.exports.Form.CheckBox.prototype.constructor = module.exports.Form.CheckBox;

module.exports.Form.RadioButton = function (group, value) {
    module.exports.Form.CheckBox.call(this, group, value);
    this.set_attr("type", "Radio");
};
module.exports.Form.RadioButton.prototype = Object.create(module.exports.Form.CheckBox.prototype);
module.exports.Form.RadioButton.prototype.constructor = module.exports.Form.RadioButton;