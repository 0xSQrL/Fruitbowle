const DEFAULT_CHUNK_SIZE = 30;


const Tile = function(){
	this.flooring = 0;
	this.wall = 0;
	this.ceiling = 0;
};

const TileZone = function(size = DEFAULT_CHUNK_SIZE){
	this.mapChunk = Array(size);
	this.entityList = Array();
	for(let i = 0; i < size; i++)
	{
		this.mapChunk[i] = Array(DEFAULT_CHUNK_SIZE);
		for(let j = 0; j < size; j++)
			this.mapChunk[i][j] = new Tile();
	}
};

module.exports = {
	Tile,
	TileZone
};