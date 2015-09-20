var express = require('express');
var router = express.Router();

router.post('/',function (req, res, next) {
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            if (fieldname == 'skin' && filename.lastIndexOf('.png') == filename.length - 4) {
                var outfile = path.join(__dirname, '..', '..', 'client', 'skins', filename);
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
);

router.get('/',function (req, res, next) {
        res.render('upload', {title: 'Cigar', game: true});
    }
);