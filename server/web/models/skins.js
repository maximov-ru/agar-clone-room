var Sequelize = require('sequelize');
var Q = require('q');
var sequelize = require('../db');
var skinsMap = {};
var skinsNames = [];
var mapLoaded = false;
var changeCallback = function (newNames){
    console.log(newNames);
};

var Skins = sequelize.define(
    'Skins',
    {
        id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
        skin: Sequelize.STRING
    },
    {
        classMethods: {
            getSkinNames: function(){
                return skinsNames;
            },
            addSkinName: function(skinName){
                if(!skinsMap[skinName]){
                    skinsNames.push(skinName);
                    skinsMap[skinName] = true;
                    changeCallback(skinsNames);
                }
            },
            initNames: function(){
                Q.async(function*() {
                        if (!mapLoaded) {
                            var skins = yield Skins.findAll();
                            for(var i in skins){
                                var skin = skins[i];
                                var uname = skin.skin;
                                if(!skinsMap[uname]){
                                    skinsNames.push(uname);
                                    skinsMap[uname] = true;
                                }
                            }
                            mapLoaded = true;
                        }
                    }
                )().done();
            },
            setChangeCb: function (cb){
                changeCallback = cb;
            },
            resetMap: function(){
                mapLoaded = false;
            }
        },
        indexes: [
            // Create a unique index on sid
            {
                unique: true,
                fields: ['skin']
            }
        ]
    }
);

module.exports = Skins;