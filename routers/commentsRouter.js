'use-strict';

var commentsHandler = require('../handlers/comments.js');
var writeResponse = require('../util/utility.js').writeResponse;

var routes = {
    "/comments/create" : commentsHandler.create,
    "/comments/delete" : commentsHandler.remove,
    "/comments/get"    : commentsHandler.get,
    "/comments/update" : commentsHandler.update
};

function commentsRouter(urlData, request, response) {
    var pathname = urlData.pathname;
    var endGameName = pathname.indexOf('/', 10);
    if (endGameName < 0) {
        writeResponse(response, 400, {'Content-Type':'text/plain'}, 'Bad request');
        return;
    }
    urlData.gameName = pathname.slice(10, endGameName).toLowerCase();
    pathname = pathname.slice(0, 9) + pathname.slice(endGameName);
    if (pathname[pathname.length-1] === '/') pathname = pathname.slice(0, -1);
    
    if (typeof routes[pathname] === 'function') {
        if (routes[pathname].methods[request.method] === 'TRUE') {
            routes[pathname](urlData, request, response);
        } else {
            writeResponse(response, 405, {'Content-Type':'text/plain'}, 'Incorrect method!');
        }
    } else {
        writeResponse(response, 404, {'Content-Type':'text/plain'}, 'URI not found!');
    };
};

module.exports = commentsRouter;