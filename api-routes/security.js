const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const process = require('process');

const base_file = `public/images/security`;

const FrameRateCounter = function (frame_defintion, timeout){

	const last_frames = {};

	function _countFrame(cameraId){

		const now = new Date().getTime();
		
		if(!(cameraId in last_frames)){
			last_frames[cameraId] = []
		}
		const last_frame = last_frames[cameraId];

		if(last_frame.length > 0 && (now - last_frame[last_frame.length - 1]) > timeout){
			last_frame.length = 0;
		}

		last_frame.push(now);
		if(last_frame.length > frame_defintion)
			last_frame.shift();
	}
	
	function _getFrameRate(cameraId){
		
		if(!(cameraId in last_frames)){
			return 0;
		}
	
		const last_frame = last_frames[cameraId];
	
		if(last_frame.length <= 1 || (new Date().getTime() - last_frame[last_frame.length - 1]) > timeout)
			return 0;
		
		let frameCount = 0;
		for(let i = 0; i < last_frame.length - 1; i++){
			frameCount += last_frame[i + 1] - last_frame[i];
		}
	
		return (last_frame.length - 1) * 1000 / frameCount;
	}

	return {
		getFrameRate: _getFrameRate,
		countFrame: _countFrame,
	}
}(6, 1000);

router.post('/uploadImage', async function (req, res) {
	let cameraId = req.query.camera;
	createFileTree(cameraId);
	limitFiles(cameraId);
	let uploadedFiles = Object.keys(req.files);
	if(uploadedFiles.length === 1){
		let file = req.files[uploadedFiles[0]];
		let extension = path.extname(file.name);
		let latest_files = fs.readdirSync(`${base_file}/${cameraId}/latest`);
		if(latest_files.length > 0){
			fs.rename(`${base_file}/${cameraId}/latest/${latest_files[0]}`, `${base_file}/${cameraId}/${latest_files[0]}`, ()=>{});
		}

		file.mv(`${base_file}/${cameraId}/latest/${new Date().getTime()}${extension}`);
		FrameRateCounter.countFrame(cameraId);
		return res.json({
			success:true
		});
	}
	res.json({
		success:false
	});

});

function limitFiles(cameraId) {
	fs.readdir(`${base_file}/${cameraId}`, (err, files)=>{
		files.forEach((file)=>{
			let file_path = `${base_file}/${cameraId}/${file}`;
			fs.stat(file_path, (err, stats)=>{
				if(stats.mtime.getTime() < new Date().getTime() - 1000 * 60 * 60){
					fs.unlinkSync(file_path);
				}
			})
		})
	});
}


function createFileTree(cameraId){
	if(!fs.existsSync(base_file))
		fs.mkdirSync(base_file);
	if(!fs.existsSync(`${base_file}/${cameraId}`))
		fs.mkdirSync(`${base_file}/${cameraId}`);
	if(!fs.existsSync(`${base_file}/${cameraId}/latest`))
		fs.mkdirSync(`${base_file}/${cameraId}/latest`);
}

router.get('/latest', async function (req, res) {
	let cameraId = req.query.camera;

	if(fs.existsSync(`${base_file}/${cameraId}/latest`)) {
		let latest_files = fs.readdirSync(`${base_file}/${cameraId}/latest`);
		if (latest_files.length > 0) {
			return res.sendFile(`${process.cwd()}/${base_file}/${cameraId}/latest/${latest_files[0]}`);
		}
	}
	res.json({
		success:false
	});
});


router.get('/framerate', async function (req, res) {
	let cameraId = req.query.camera;

	res.json({
		frame_rate: FrameRateCounter.getFrameRate(cameraId)
	});
	
});

module.exports = router;