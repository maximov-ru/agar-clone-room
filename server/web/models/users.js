var Sequelize = require('sequelize');
var Q = require('q');
var sequelize = require('../db');
var usersMap = {};
var mapLoaded = false;


var User = sequelize.define(
    'User',
    {
        id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
        username: Sequelize.STRING,
        password: Sequelize.STRING,
        skin: Sequelize.STRING
    },
    {
        classMethods: {
            authorize: function(username,password,cb){
                var findusername = username.toLowerCase();
                Q.async(function*() {
                        if (!mapLoaded) {
                            var users = yield User.findAll();
                            for(var i in users){
                                var user = users[i];
                                var uname = user.username.toLowerCase();
                                usersMap[user] = true;
                            }
                            mapLoaded = true;
                        }
                        if(usersMap[findusername]) {
                            var user = yield User.findOne({where: {username: findusername}})
                            if(password == user.password){
                                cb(null,true);
                            }else{
                                cb(null,false);
                            }
                        }else{
                            cb(null,true);
                        }
                    }
                )().done();
            },
            checkUserExists: function(username,cb){
                var findusername = username.toLowerCase();
                Q.async(function*()
                    {
                        if (!mapLoaded) {
                            var users = yield User.findAll();
                            for(var i in users){
                                var user = users[i];
                                var uname = user.username.toLowerCase();
                                usersMap[user] = true;
                            }
                            mapLoaded = true;
                        }
                        cb(null,usersMap[findusername]);
                    }
                )().done();
            },
            resetMap: function(){
                mapLoaded = false;
            }
        },
        indexes: [
            // Create a unique index on sid
            {
                unique: true,
                fields: ['username']
            }
        ]
    }
);

module.exports = User;