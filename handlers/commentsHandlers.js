'use-strict';

//  Request handler object for comments
var querystring = require('querystring');
var commentDS = (require('../datastore/datastore.js'))().comments;
var writeResponse = require('../util/utility.js').writeResponse;

var commentsHandlers = {};

//  /comments/<game name>/create?username=""
commentsHandlers.create = function commentsHandlersCreate(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    if (!params.username) {
        writeResponse(response, 400, {'Content-Type':'text/plain'}, 'Bad request');
        return;
    }
    params.content = '';
    request.on('data', function(datachunk) {
        params.content += datachunk;
    });
    request.on('end', function() {
        commentDS.create(urlData.gameName, params, response);
    });
};
commentsHandlers.create.methods = { 'POST':'TRUE' };

//  /comments/<game name>/get
commentsHandlers.get = function commentsHandlersGet(urlData, request, response) {
    commentDS.getByGame(urlData.gameName, response);
};
commentsHandlers.get.methods = { 'GET':'TRUE' };

//  /comments/<game name>/delete?id=#
commentsHandlers.remove = function commentsHandlersRemove(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    if (!params.id) {
        writeResponse(response, 400, {'Content-Type':'text/plain'}, 'Bad request');
        return;
    }
    params.id = +params.id;
    commentDS.remove(urlData.gameName, params.id, response);
};
commentsHandlers.remove.methods = { 'DELETE':'TRUE' };

//  /comments/<game name>/update?id=#
commentsHandlers.update = function commentsHandlersUpdate(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    params.id = +params.id;
    if (!params.id || typeof params.id !== 'number') {
        writeResponse(response, 400, {'Content-Type':'text/plain'}, 'Bad request');
        return;
    }
    params.newcontent = '';
    request.on('data', function(datachunk) {
        params.newcontent += datachunk;
    });
    request.on('end', function() {
        commentDS.update(urlData.gameName, params, response);
    });
};
commentsHandlers.update.methods = { 'PUT':'TRUE' };

module.exports = commentsHandlers;