const basics = require('./basic_elements');
const fs = require('fs');

let Row = function (id, ...rows) {
    basics.BasicContainer.call(this, `tr`, ...rows);
    this.set_attr("id", id);
};
Row.prototype = Object.create(basics.BasicContainer.prototype);
Row.prototype.constructor = Row;


let Col = function (id, heading, ...content) {
	basics.BasicContainer.call(this, heading ? 'th' : 'td', ...content);
	this.set_attr("id", id);
};
Col.prototype = Object.create(basics.BasicContainer.prototype);
Col.prototype.constructor = Col;



let ColWidth = function () {
	basics.BasicContent.call(this, 'col');
};
ColWidth.prototype = Object.create(basics.BasicContent.prototype);
ColWidth.prototype.constructor = ColWidth;

module.exports.Table = function (id, data, first_row_title, per_row, per_col, per_col2) {
    basics.BasicContainer.call(this, `table`);
    this.set_attr('id', id);
    this.id = id;
    if(data)
        this.set_data(data, first_row_title, per_row, per_col, per_col2)
};
module.exports.Table.prototype = Object.create(basics.BasicContainer.prototype);
module.exports.Table.prototype.constructor = module.exports.Table;

module.exports.Table.prototype.set_data = function(data, first_row_title, per_row, per_col, per_col2){
    this.columns = data[0].length;
    this.rows = data.length;
    if(first_row_title)
        this.first_row_title = true;
    else if (typeof first_row_title !== 'undefined')
    	this.first_row_title = false;
    this.contents = [];
    let first = this.first_row_title;
    let i = 0, j = 0;
    let table_id = this.id;
    let contents = this.contents;

    data.forEach(function(row){
        let cols = [];

        row.forEach(function(col_data){
			let newCol;
			if(col_data.length)
				newCol = new Col(`${table_id}_${i}_${j}`, first, ...col_data);
			else
				newCol = new Col(`${table_id}_${i}_${j}`, first, col_data);
            cols.push(newCol);
            if(per_col)
                per_col(newCol, i, j);
            j++;
        });

        const newRow = new Row(`${table_id}_${i}`, ...cols);
        contents.push(newRow);
        if(per_row)
            per_row(newRow, i);
        first = false;
        i++;
        j=0;
    });
	if(per_col2){
		for (let k = this.columns - 1; k >= 0; k--) {
			let col = new ColWidth();
			per_col2(col, k);
			contents.unshift(col);
		}
	}
    return this;
};

module.exports.Subpage = function (path) {
	this.path = path;
	this.replacements = [];
	let replacements = this.replacements;
	let self = this;
	this.add_substitution = function (key, value) {
		replacements.push({
			key: key,
			value: value
		});
		return self;
	};
	this.to_html = function () {
		let fileContent = fs.readFileSync(path, 'utf8');
		replacements.forEach((kvPair)=>{
			let pattern = new RegExp(kvPair.key, "g");
			fileContent = fileContent.replace(pattern, kvPair.value);
		});
		return fileContent;
	};
};

