'use-strict';

var gamesHandler = require('../handlers/gamesHandlers.js');
var routes = {
    "/games/create" : gamesHandler.create,
    "/games/get"    : gamesHandler.get,
    "/games/update" : gamesHandler.update
};

function gamesRouter(urlData, request, response) {
    var pathname = urlData.pathname;
    if (pathname[pathname.length-1] === '/') pathname = pathname.slice(0, -1);
    
    if (typeof routes[pathname] === 'function') {
        if (routes[pathname].methods[request.method] === 'TRUE') {
            routes[pathname](urlData, request, response);
        } else {
            response.writeHead(405, {'Content-Type':'text/plain'});
            response.write('Incorrect method!');
            response.end();
        }
    } else {
        response.writeHead(404, {'Content-Type':'text/plain'});
        response.write('URI not found!');
        response.end();
    };
};

module.exports = gamesRouter;
