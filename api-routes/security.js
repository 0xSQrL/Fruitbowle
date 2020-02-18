const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const process = require('process');
console.log("HERER");

const base_file = `public/images/security`;

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

module.exports = router;