'use-strict';

//  Request handler object for /games
var querystring = require('querystring');
var gameDS = (require('../datastore/datastore.js'))().games;

var gamesHandlers = {};

//  /games/create?name=""&description=""&publisher=""
gamesHandlers.create = function gamesHandlersCreate(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    gameDS.create(params, response);
};
gamesHandlers.create.methods = { 'POST':'TRUE' };

//  /games/get&name=""
gamesHandlers.get = function gamesHandlersGet(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    gameDS.get(params.name, response);
};
gamesHandlers.get.methods = { 'GET':'TRUE' };

//  /games/update?name=""&newname=""&newdescription=""&newpublisher="" => only requires one of last 3 attributes
gamesHandlers.update = function gamesHandlersUpdate(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    gameDS.update(params.name, params, response);
};
gamesHandlers.update.methods = { 'PUT':'TRUE' };

module.exports = gamesHandlers;