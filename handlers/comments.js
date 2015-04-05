'use-strict';

var commentsHandlers = {};

//  /comments/create
commentsHandlers.create = function commentsHandlersCreate(urlData, request, response) {
    response.writeHead(200, {'Content-Type':'text/plain'});
    response.write('Create comment handler called successfully!');
    response.end();
};
commentsHandlers.create.methods = { 'POST':'TRUE' };

//  /comments/delete
commentsHandlers.destroy = function commentsHandlersDestroy(urlData, request, response) {
    response.writeHead(200, {'Content-Type':'text/plain'});
    response.write('Destroy handler called successfully!');
    response.end();
};
commentsHandlers.destroy.methods = { 'DELETE':'TRUE' };

//  /comments/get
commentsHandlers.get = function commentsHandlersGet(urlData, request, response) {
    response.writeHead(200, {'Content-Type':'text/plain'});
    response.write('Get handler called successfully!');
    response.end();
};
commentsHandlers.get.methods = { 'GET':'TRUE' };

//  /comments/update
commentsHandlers.update = function commentsHandlersUpdate(urlData, request, response) {
    response.writeHead(200, {'Content-Type':'text/plain'});
    response.write('Update comment handler called successfully!');
    response.end();
};
commentsHandlers.update.methods = { 'PUT':'TRUE' };

module.exports = commentsHandlers;