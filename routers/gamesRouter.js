'use-strict';

var gamesHandler = require('../handlers/games.js');
var routes = {
    "/games/create-game":gamesHandler.create,
    "/games/update":gamesHandler.update,
    "/games/get-all":gamesHandler.getAll
};

function gamesRouter(urlData, request, response) {
    var pathname = urlData.pathname;
    if (pathname[pathname.length-1] === '/') pathname = pathname.slice(0, -1);
    console.log(request.method + ' :: ' + pathname);
    
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


/*
    response.writeHead(200, {'Content-Type':'text/plain'});
    response.write('Hello games!');
    response.end();
*/