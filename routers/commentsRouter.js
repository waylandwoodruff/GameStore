'use-strict';

var commentsHandler = require('../handlers/comments.js');
var routes = {
    "/comments/create" : commentsHandler.create,
    "/comments/delete" : commentsHandler.destroy,
    "/comments/get"    : commentsHandler.get,
    "/comments/update" : commentsHandler.update
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