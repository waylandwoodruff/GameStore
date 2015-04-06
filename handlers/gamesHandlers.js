'use-strict';

//  Request handler object for /games
var querystring = require('querystring');
var gameDS = (require('../datastore/datastore.js'))().games;
var writeResponse = require('../util/utility.js').writeResponse;

var gamesHandlers = {};

//  /games/create?name=""&publisher=""
gamesHandlers.create = function gamesHandlersCreate(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    if (!params.name) {
        writeResponse(response, 400, {'Content-Type':'text/plain'}, 'Bad request');
        return;
    }
    params.description = '';
    request.on('data', function(datachunk) {
        params.description += datachunk;
    });
    request.on('end', function() {
        gameDS.create(params, response);
    });
};
gamesHandlers.create.methods = { 'POST':'TRUE' };

//  /games/get?name=""
gamesHandlers.get = function gamesHandlersGet(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    if (!params.name) {
        writeResponse(response, 400, {'Content-Type':'text/plain'}, 'Bad request');
        return;
    }
    gameDS.get(params.name, response);
};
gamesHandlers.get.methods = { 'GET':'TRUE' };

//  /games/update?name=""&newname=""&newpublisher=""
gamesHandlers.update = function gamesHandlersUpdate(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    if (!params.name) {
        writeResponse(response, 400, {'Content-Type':'text/plain'}, 'Bad request');
        return;
    }
    params.newdescription = '';
    request.on('data', function(datachunk) {
        params.newdescription += datachunk;
    });
    request.on('end', function() {
        gameDS.update(params.name, params, response);
    });
};
gamesHandlers.update.methods = { 'PUT':'TRUE' };

module.exports = gamesHandlers;