var Sequelize = require('sequelize'),
    cfg = require('./config');


var sequelize = new Sequelize(cfg.db);
module.exports = sequelize;