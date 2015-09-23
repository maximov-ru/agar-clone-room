var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var busboy = require('connect-busboy');
var http = require('http');
var hbs = require('hbs');
var index_route = require('./routes/index');
var auth_route = require('./routes/authorization');
var upload_route = require('./routes/upload');
var Users = require('./models/users');
var Skins = require('./models/skins');
var app = null,
    masterServer = null,
    io = null;
var totalUsers = 0;

function appStart(app_obj,master,io_serv) {
    console.log(2,app_obj);
    app = app_obj;
    masterServer = master;
    io = io_serv
    Users.sync();
    Skins.sync();
    Skins.initNames();


    //var app = express();

    app.setMaster = function (server) {
        masterServer = server;
        this.updateRegions();
    };

    app.setIO = function (socket_io) {
        io = socket_io;//add socket io object for controll this
        io.on('connection', function (socket) {
            console.log('a user connected');//TODO: удалить это после теста
            totalUsers++;
            socket.on('disconnect', function () {
                totalUsers--;
                console.log('user disconnected');//TODO: удалить это после теста
            });
            socket.on('getNamesList', function (data) {
                socket.emit('namesList', Skins.getSkinNames());
            });
        });
        Skins.setChangeCb(
            function (names) {
                io.emit('namesList', names);
            }
        );
    };
    app.setMaster(masterServer);
    app.setIO(io);


    app.updateRegions = function () {
        app.locals.regions = [];
        for (var key in masterServer.REGIONS) {
            switch (key) {
                case 'US-Fremont':
                    app.locals.regions.push({val: key, name: 'US West'});
                    break;
                case 'US-Atlanta':
                    app.locals.regions.push({val: key, name: 'US East'});
                    break;
                case 'BR-Brazil':
                    app.locals.regions.push({val: key, name: 'South America'});
                    break;
                case 'EU-London':
                    app.locals.regions.push({val: key, name: 'Europe'});
                    break;
                case 'RU-Russia':
                    app.locals.regions.push({val: key, name: 'Russia'});
                    break;
                case 'TK-Turkey':
                    app.locals.regions.push({val: key, name: 'Turkey'});
                    break;
                case 'JP-Tokyo':
                    app.locals.regions.push({val: key, name: 'East Asia'});
                    break;
                case 'CN-China':
                    app.locals.regions.push({val: key, name: 'China'});
                    break;
                case 'SG-Singapore':
                    app.locals.regions.push({val: key, name: 'Oceania'});
                    break;
                default:
                    app.locals.regions.push({val: key, name: key.split('-').join(' ')});
            }
        }
    };

// view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'hbs');

    /* variables */
    app.locals.regions = [];
    app.locals.modes = [{val: '', name: 'FFA'},
        {val: ':teams', name: 'Teams'},
        {val: ':experimental', name: 'Experimental'}];

// uncomment to display links at the bottom of the login page
//app.locals.links = [{val: 'tos.html', name: 'Terms of Service'}, {val: '#', name: 'Another link...'}];

// uncomment to use a banner
//app.locals.banner = '/img/banner.png';

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(logger('dev'));
    app.use(busboy({limits: {fileSize: 512 * 1024}}));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use('/', index_route);
    app.use('/auth', auth_route);
    app.use('/upload', upload_route);
    app.use('/js', express.static(__dirname + '/js/'));


    app.post('/', function (req, res, next) {
        var post = req.body;
        // Data
        var key = Object.keys(post)[0];

        if (key in masterServer.REGIONS) {
            // Send if region exists
            post = masterServer.getServer(key);
        } else {
            // Region does not exist!
            post = "0.0.0.0";
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200);
        res.end(post);
    });

    app.get('/info', function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200);
        res.end(JSON.stringify(masterServer.info));
    });

    app.use(express.static(path.join(__dirname, '..', '..', 'client')));

// catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

// error handlers

// development error handler
// will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

// production error handler
// no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}

module.exports.app = app;
module.exports.appStart = appStart;
