var express = require('express');
var path = require('path');
var multer = require('multer');
var upload = multer({ dest: 'skins/' });
var router = express.Router();
var fs = require('fs');
var Skins = require('../models/skins');

router.post('/', upload.single('skin'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.body); // form fields
    var msg = 'нечего грузить';
    if(req.body.login && req.body.login == "admin" && req.body.password && req.body.password == "agar12354fun"){
        if(req.file){
            var filename = '';
            if(req.body.nick){
                filename = req.body.nick+'.png';
            }else{
                filename = req.file.originalname;
            }
            var skinname = filename.substr(0,filename.length - 4);
            var newPath = path.join(__dirname, '..', '..', '..', 'client', 'skins', filename);
            var oldPath = path.join(__dirname, '..', '..', '..', 'skins', req.file.filename);
            fs.renameSync(oldPath, newPath);
            if(fs.accessSync(newPath, fs.R_OK)){
                Skins.addSkinName(skinname);
                Skins.build({skin: skinname});
                msg = 'Успешно загружен скин для '+skinname;
                console.log(msg);
            }else{
                console.log('file not exists');
            }
        }else{
            console.log('no file!');
        }
    }
    console.log('done upload');
    res.render('upload', {title: 'Cigar', game: true,msg:msg});


});
/*
router.post('/',function (req, res, next) {
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            if (fieldname == 'skin' && filename.lastIndexOf('.png') == filename.length - 4) {
                var outfile = path.join(__dirname, '..', '..', '..', 'client', 'skins', filename);
                fs.stat(outfile, function (err, stats) {
                    if (err && err.code == 'ENOENT') {
                        fstream = fs.createWriteStream(outfile);
                        file.pipe(fstream);
                        fstream.on('close', function () {
                            if (file.truncated) {
                                fs.unlink(outfile, function (err) {
                                    if (err) throw err;
                                    res.redirect('/?uploaderr=toobig');
                                });
                            } else {
                                res.send('ok');
                            }
                        });
                    } else {
                        res.redirect('/?uploaderr=exists');
                    }
                });
            } else {
                res.redirect('/?uploaderr=unknown');
            }
        });
}
);*/

router.get('/',function (req, res, next) {
        res.render('upload', {title: 'Cigar', game: true, msg: ''});
    }
);


module.exports = router;