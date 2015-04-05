'use-strict';

//  Need to initialize dependencies
//      How are we storing data?
//      What are the data objects we're creating?

var datamodel = require('../config/deployment_mode.js')().datamodel;
var datastore = null;

function initializeDatastore(deploymentMode) {
    datastore = {
        'games':datamodel.game,
        'comments':datamodel.comments
    };
};

function checkDatastore() {
    if (!datastore || typeof datastore !== 'object') {
        initializeDatastore();
    }
    
    return datastore;
};

module.exports = checkDatastore;