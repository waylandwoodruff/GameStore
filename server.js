'use strict';

var server = require('./config/deployment_mode.js')('LOCAL');
var router = require('./config/routers.js');

server.start(router);
