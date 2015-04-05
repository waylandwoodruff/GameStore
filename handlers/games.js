'use-strict';

//  Request handler object for /games
var querystring = require('querystring');
var gameDS = (require('../datastore/datastore.js'))().games;
console.log(gameDS);

var gamesHandlers = {};

//  /games/create?name=""&description=""&publisher=""
gamesHandlers.create = function gamesHandlersCreate(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    gameDS.create(params, response);
};
gamesHandlers.create.methods = { 'POST':'TRUE' };

//  /games/get/
gamesHandlers.getAll = function gamesHandlersGet(urlData, request, response) {
    response.writeHead(200, {'Content-Type':'text/plain'});
    response.write('Get all handler called successfully!');
    response.end();
};
gamesHandlers.getAll.methods = { 'GET':'TRUE' };

//  /games/update?name=""&newname=""&newdescription=""&newpublisher="" => only requires one of last 3 attributes
gamesHandlers.update = function gamesHandlersUpdate(urlData, request, response) {
    response.writeHead(200, {'Content-Type':'text/plain'});
    response.write('Update game handler called successfully!');
    response.end();
};
gamesHandlers.update.methods = { 'PUT':'TRUE' };

module.exports = gamesHandlers;