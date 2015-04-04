'use strict';


var server = require('./config/deployment_mode.js')('LOCAL');
var routers = require('./config/routers.js');
//var requestHandlers = require('./config/requestHandlers.js');

server.start(routers);










































