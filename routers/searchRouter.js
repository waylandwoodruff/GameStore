'use-strict';

var searchHandler = require('../handlers/searchHandlers.js');
var writeResponse = require('../util/utility.js').writeResponse;

var routes = {
    "/search"       : searchHandler.gameSearch,
    "/search/games" : searchHandler.gameSearch
};

function searchRouter(urlData, request, response) {
    var pathname = urlData.pathname;
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

module.exports = searchRouter;
