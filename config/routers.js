'use-strict';

var defaultRouter = require('../routers/defaultRouter.js');

var routes = {
    '/':defaultRouter
};

function routeRequest(urlData, response) {
    if (typeof routes[urlData.pathname] === 'function') {
        setTimeout(function routing() {
            routes[urlData.pathname](urlData, response);
        }, 0);
    } else {
        response.writeHead(404, {'Content-Type':'text/plain'});
        response.write('404: Not found!');
        response.end();
    }
};

module.exports = routeRequest;