var Point = function(x, y){
	this.x = x | 0;
	this.y = y | 0;

	this.clone = function(){
		return new Point(this.x, this.y);
	}
};

var Joint = function(x, y, r){
	this.rotation = r | 0;
	this.position = new Point(x, y);
	this.parent = undefined;

	this.get_rotation = function () {
		if(typeof this.parent === 'undefined')
			return this.rotation;
		return this.parent.get_rotation() + this.rotation;
	};

	this.get_position = function () {

		if(typeof this.parent === 'undefined')
			return this.position;
		let tempPos = this.parent.get_position().clone();
		let rotation = this.parent.get_rotation();
		tempPos.x += this.position.x * Math.cos(rotation) - this.position.y * Math.sin(rotation);
		tempPos.y += this.position.y * Math.cos(rotation) + this.position.x * Math.sin(rotation);
		return tempPos;
	}
};