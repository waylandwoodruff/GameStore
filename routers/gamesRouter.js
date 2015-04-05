'use-strict';

function defaultRouter(urlData, response) {
    response.writeHead(200, {'Content-Type':'text/plain'});
    response.write('Hello games!');
    response.end();
};

module.exports = defaultRouter;