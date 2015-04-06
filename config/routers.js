'use-strict';

var writeResponse = require('../util/utility.js').writeResponse;

var routes = {
    '/':require('../routers/defaultRouter.js'),
    '/games':require('../routers/gamesRouter.js'),
    '/comments':require('../routers/commentsRouter.js')
};

function routeRequest(urlData, request, response) {
    //  Collect first part of url path and send request off to that router asynchronously if it exists
    var nextSlash = urlData.pathname.indexOf('/', 1);
    var basepath = urlData.pathname.slice(0, ((nextSlash > 0) ? nextSlash : undefined));
    if (basepath === '') basepath = '/';
    
    if (typeof routes[basepath] === 'function') {
        setTimeout(function routing() {
            routes[basepath](urlData, request, response);
        }, 0);
    } else {
        writeResponse(response, 404, {'Content-Type':'text/plain'}, '404: Not found!');
    }
};

module.exports = routeRequest;