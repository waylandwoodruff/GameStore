'use-strict';

var http = require('http');
var url = require('url');

function configureServer(deploymentMode) {
    var port = 8888;    //  default port
    
    switch (deploymentMode) {
        case 'LOCAL':
            break;
        case 'AZURE':
            break;
        default:
            console.log('ERROR! Deployment mode ' + deploymentMode + ' not recognized!');
            console.log('Defaulting to localhost deployment...');
            deploymentMode = 'LOCAL';
    }
    
    return {
        'start':function startServer(route) {
            function onRequest(request, response) {
                route(url.parse(request.url));      //  TODO: CURRENTLY DOES NOTHING!!!! Remedy that!
                
                response.writeHead( 200, {'Content-Type':'text/plain'});
                response.write('Hello world!');
                response.end();
            };
            
            http.createServer(onRequest).listen(port);
            console.log('Server has started. Listening on port: ' + port);
        }
    };
};

module.exports = configureServer;