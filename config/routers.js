'use-strict';

var routes = {
    '/':require('../routers/defaultRouter.js'),
    '/games':require('../routers/gamesRouter.js')
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
        response.writeHead(404, {'Content-Type':'text/plain'});
        response.write('404: Not found!');
        response.end();
    }
};

module.exports = routeRequest;