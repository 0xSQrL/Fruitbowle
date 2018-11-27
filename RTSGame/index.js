const blocks_per_chunk = 10;

let map_area = [];

function GroundType(is_walkable, is_water){
	this.is_walkable = is_walkable;
	this.is_water = is_water;
	this.index = 0;
}

function populate_chunk(x, y){
	const chunk_local = x + '_' + y;
	map_area[chunk_local] = [];
	for(let i = 0; i < blocks_per_chunk; i++){
		map_area[chunk_local][i] = [];
		for(let j = 0; j < blocks_per_chunk; j++){
			map_area[chunk_local][i][j] = {ground_type: 0};
		}
	}
}

function get_chunk(x, y){
	const chunk_local = x + '_' + y;
	return map_area[chunk_local];
}

module.exports.map_area = map_area;
