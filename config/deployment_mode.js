'use-strict';

var http = require('http');
var url = require('url');

var datamodel;
var start;

function serverGlobals(deploymentMode) {
    var port = 8888;    //  default port
    
    if (!datamodel || typeof datamodel !== 'object') {
        switch (deploymentMode) {
            default:
                datamodel = require('../datastore/localModel.js');
        }
        datamodel.initialize();
    }
    
    if (typeof start !== 'function') {
        start = function startServer(router) {
            function onRequest(request, response) {
                router(url.parse(request.url), request, response);
            };
            
            http.createServer(onRequest).listen(port);
            console.log('Server has started. Listening on port: ' + port);
        }
    }
    
    return {
        'datamodel' : datamodel,
        'start'     : start
    };
};

module.exports = serverGlobals;