const {exec} = require('child_process');
const express = require('express');
const fs = require('fs');
const router = express.Router();

const topFolder = "javacompiler";

router.post('/submit', async function (req, res) {

    let folders = getUserFolders(req.user);
    let files = req.body.files;

    console.log(files);

    files.forEach(file =>{
        fs.writeFile(`${folders.source}/${file.filename}`, file.contents);
    });

    return res.status(201).json({
        success: true
    });
});

router.get('/load', async function (req, res) {

    let folders = getUserFolders(req.user);
    let fileObjects = [];
    let files = fs.readdirSync(folders.source);
    for(let i = 0; i < files.length; i++)
        fileObjects.push({filename: files[i], contents: fs.readFileSync(`${folders.source}/${files[i]}`, 'utf8')});

    return res.status(200).json({
        files: fileObjects
    });

});

function javaCodeIsValid(text){

    const validImport = /import\s+java\.*;/;
    const invalidImport = /import\sjava\.util\.\S*;/;

    if(validImport.test(text)){
        //Has import

    }

    if(invalidImport.test(text))
        return false;

    return true;
}

function getUserFolders(user){
    let userid = user.id;
    establishBaseFolder();
    let userFolder = `${topFolder}/${userid}`;
    let sourceFolder = `${userFolder}/src`;
    let binaryFolder = `${userFolder}/bin`;

    if(!fs.existsSync(userFolder)){
        fs.mkdirSync(userFolder);
        fs.mkdirSync(sourceFolder);
        fs.mkdirSync(binaryFolder);
    }
    return {base: userFolder,
            source: sourceFolder,
            binary: binaryFolder};
}

function sourceFolder(userFolder){
    return `${userFolder}/src`;
}

function binariesFolder(userFolder) {

}

function establishBaseFolder(){
    if(!fs.existsSync(topFolder))
        fs.mkdirSync(topFolder);
}

module.exports = router;