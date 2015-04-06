'use-strict';

function defaultRouter(urlData, request, response) {
    response.writeHead(200, {'Content-Type':'text/plain'});
    response.write('Hello!');
    response.end();
};

module.exports = defaultRouter;