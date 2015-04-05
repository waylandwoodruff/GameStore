'use-strict';

function defaultRouter(urlData, request, response) {
    response.writeHead(200, {'Content-Type':'text/plain'});
    response.write('Hello world!');
    response.end();
};

module.exports = defaultRouter;