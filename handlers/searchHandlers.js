'use-strict';

//  Request handler object for /search
var querystring   = require('querystring');
var searchDS      = (require('../datastore/datastore.js'))().search;
var utility       = require('../util/utility.js');
var makeRegex     = utility.strToRegex;
var writeResponse = utility.writeResponse;

var searchHandlers = {};

//  /search/games?q=""&name=#&desc=#&publisher=#
//      q => Query string (required)
//      name, desc, publisher => Optional, expected to be 0 or 1. Flags whether to search that parameter
searchHandlers.gameSearch = function searchHandlersGameSearch(urlData, request, response) {
    var params = querystring.parse(urlData.query);
    if (!params.q) {
        writeResponse(response, 200, {'Content-Type':'application/json'}, '{results:[]}');
        return;
    }
    params.name = (params.name !== undefined) ? +params.name : 0;
    params.desc = (params.desc !== undefined) ? +params.desc : 0;
    params.publisher = (params.publisher !== undefined) +params.publisher : 0;
    if (isNaN(params.name) || isNaN(params.desc) || isNaN(params.publisher)) {
        writeResponse(response, 400, {'Content-Type':'text/plain'}, 'Bad request');
        return;
    }
    if (!params.name && !params.desc && !params.publisher) {
        params.name = params.desc = params.publisher = 1;
    }
    params.regexList = makeRegex(params.q);
    searchDS.gameSearch(params, response);
};
searchHandlers.gameSearch.methods = { 'GET':'TRUE' };

module.exports = searchHandlers;
