var express = require('express');
var router = express.Router();
var users = require('../models/users');

/* GET home page. */
router.post('/', function (req, res, next) {
    if(req.body.hasOwnProperty('username')){
        users.checkUserExists(req.body.username,function(err,ret){
            ret.json(ret?true:false);
        })
    }
});

router.post('/auth', function (req, res, next) {
    if(req.body.hasOwnProperty('username') && req.body.hasOwnProperty('password')){
        users.authorize(req.body.username,req.body.password,function(err,ret){
            ret.json(ret);
        });
    }
});

module.exports = router;