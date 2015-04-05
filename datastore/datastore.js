'use-strict';

//  Need to initialize dependencies
//      How are we storing data?
//      What are the data objects we're creating?

var datamodel = require('../config/deployment_mode.js').datamodel;
var datastore = {};

function initializeDatastore(deploymentMode) {
    var datamodel;
    switch (deploymentMode) {
        default:
            datamodel = require('../config/deployment_mode.js').datamodel;
    }
    
    datastore = {
        'game':datamodel.game,
        'comments':datamodel.comments
    };
;

function checkDatastore(deploymentMode) {
    if (!datastore || typeof datastore !== 'object') {
        deploymentMode = (typeof deploymentMode === 'string') ? deploymentMode : DEFAULT_DEPLOYMENT_MODE;
        initializeDatastore(deploymentMode);
    }
    
    return datastore;
};

modules.exports = checkDatastore;