'use-strict';

//  Request handler object for comments
var querystring = require('querystring');
var commentDS = (require('../datastore/datastore.js'))().comments;
var writeResponse = require('../util/utility.js').writeResponse;

var commentsHandlers = {};

//  /comments/<game name>/create?username=""&content=""
commentsHandlers.create = function commentsHandlersCreate(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    if (typeof params.username !== 'string' || typeof params.content !== 'string') {
        writeResponse(response, 400, {'Content-Type':'text/plain'}, 'Bad request');
        return;
    }
    commentDS.create(urlData.gameName, params, response);
};
commentsHandlers.create.methods = { 'POST':'TRUE' };

//  /comments/<game name>/delete?id=#
commentsHandlers.remove = function commentsHandlersRemove(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    commentDS.create(params, response);
};
commentsHandlers.remove.methods = { 'DELETE':'TRUE' };

//  /comments/<game name>/get
commentsHandlers.get = function commentsHandlersGet(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    commentDS.create(params, response);
};
commentsHandlers.get.methods = { 'GET':'TRUE' };

//  /comments/<game name>/update?id=#&newcontent
commentsHandlers.update = function commentsHandlersUpdate(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    commentDS.create(params, response);
};
commentsHandlers.update.methods = { 'PUT':'TRUE' };

module.exports = commentsHandlers;