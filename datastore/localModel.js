'use-strict';

var fs = require('fs');
var utility = require('../util/utility.js');
var binarySearch = utility.arrBinarySearch;
var writeResponse = utility.writeResponse;

var idx = 0;
var key = null;
var datasets = [
    'datastore/localData/games.json',
    'datastore/localData/comments.json'
];
var initJSON = {
    'datastore/localData/games.json'    : '{}',
    'datastore/localData/comments.json' : '{"gameComments":{},"lastCommentID":0}'
};
var operationQueue = {
    'games'    : new dualStackQueue(),
    'comments' : new dualStackQueue()
};
var semaphores = {};
for (idx = 0; idx < datasets.length; idx++) {
    semaphores[datasets[idx]] = new semaphore();
}

function dualStackQueue() {
    var input = [];
    var output = [];
    this.dqOp = null;
    function isOutputEmpty() {
        if (output.length <= 0) {
            while (input.length > 0) {
                output.push(input.pop());
            }
        }
    };
    this.Nq = function dualStackQueueEnqueue(task, callback) {
        input.push(task);
        if (typeof callback === 'function') callback();
        isOutputEmpty();
    };
    this.enqueue = this.Nq;
    this.Dq = function dualStackQueueDequeue(callback) {
        if (output.length <= 0) {
            isOutputEmpty();
            return;
        }
        if (typeof this.dqOp === 'function') this.dqOp(output.pop(), callback);
        isOutputEmpty();
    };
    this.dequeue = this.Dq;
    this.operationLoop = function dualStackQueueOperationLoop(me) {
        setTimeout(function() {
            me.Dq();
            me.operationLoop(me);
        }, 0);
    };
    this.operationLoop(this);
};

function semaphore() {
    var taskQ = new dualStackQueue();
    var inUse = false;
    function semaphoreIterFunc() {
        if (inUse) return;
        inUse = true;
        taskQ.Dq(function() { inUse = false; });
        setTimeout(semaphoreIterFunc, 0);
    };
    this.addDqOp = function semaphoreAddDqOp(dqFunc) {
        taskQ.dqOp = dqFunc;
    };
    this.addTask = function semaphoreAddTask(task, callback) {
        taskQ.Nq(task, callback);
    };
    setTimeout(semaphoreIterFunc, 0);
};

function operationQueueDqOp(task, callback) {
    if (typeof task !== 'function') {
        if (typeof callback === 'function') callback({ 'errno':1, 'errorText':'Task not a function!' });
        return;
    }
    var fr = task.fileResource;
    if (fr && typeof fr === 'string' && semaphores[fr]) {
        semaphores[fr].addTask(task, callback);
    } else {
        if (typeof callback === 'function') callback({ 'errno':2, 'errorText':'File resource has no semaphore!'});
    }
};

for (key in operationQueue) {
    operationQueue[key].dqOp = operationQueueDqOp;
}

function semaphoreQueueDqOp(task, callback) {
    if (typeof task !== 'function') {
        if (typeof callback === 'function') callback({ 'errno':1, 'errorText':'Task not a function!' });
        return;
    }
    task(callback);
};

for (key in semaphores) {
    semaphores[key].addDqOp(semaphoreQueueDqOp);
}

function initializeLocalModel() {
    //  Synchronous for initialization only
    var fd;
    try {
        fs.mkdirSync('datastore/localData', '666');
    } catch(e) { if (e.code !== 'EEXIST') console.log(e); }
    for (var i = 0; i < datasets.length; i++) {
        try {
            fd = fs.openSync(datasets[i], 'wx+');
            fs.appendFileSync(datasets[i], initJSON[datasets[i]]);
            fs.closeSync(fd);
        } catch(e) { if (e.code !== 'EEXIST') console.log(e); }
    }
};

var game = {};
game.create = function localGameCreate(newGame, response) {
    function task(callback) {
        var cbIsFunc = typeof callback === 'function';
        fs.readFile(datasets[0], 'utf8', function(error, data) {
            if (error) {
                if (cbIsFunc) callback();
                console.log(error);
                writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not access database!');
                return;
            }
            var filedata = JSON.parse(data);
            var gameName = newGame.name.toLowerCase();
            if (filedata[gameName]) {
                if (cbIsFunc) callback();
                writeResponse(response, 403, {'Content-Type':'text/plain'}, 'Game already exists in database!');
                return;
            }
            filedata[gameName] = newGame;
            fs.writeFile(datasets[0], JSON.stringify(filedata), 'utf8', function(error) {
                if (cbIsFunc) callback();
                if (error) {
                    console.log(error);
                    writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not create game!');
                } else {
                    writeResponse(response, 201, {'Content-Type':'text/plain'}, 'Successfully created game.');
                }
            });
        });
    };
    task.fileResource = datasets[0];
    operationQueue.games.enqueue(task);
};
game.get = function localGameGet(name, response) {
    function task(callback) {
        var cbIsFunc = typeof callback === 'function';
        fs.readFile(datasets[0], 'utf8', function(error, data) {
            if (cbIsFunc) callback();
            if (error) {
                console.log(error);
                writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not access database!');
                return;
            }
            var gameIndex = data.indexOf('"' + name.toLowerCase() + '":{');
            if (gameIndex < 0) {
                writeResponse(response, 404, {'Content-Type':'text/plain'}, 'Game not found.');
                return;
            }
            var gameJSON = data.slice(data.indexOf('{', gameIndex), (1 + data.indexOf('}', gameIndex)));
            writeResponse(response, 200, {'Content-Type':'application/json'}, gameJSON);
        });
    };
    task.fileResource = datasets[0];
    operationQueue.games.enqueue(task);
};
game.update = function localGameUpdate(gameName, updates, response) {
    function task(callback) {
        var cbIsFunc = typeof callback === 'function';
        fs.readFile(datasets[0], 'utf8', function(error, data) {
            if (error) {
                if (cbIsFunc) callback();
                console.log(error);
                writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not access database!');
                return;
            }
            var filedata = JSON.parse(data);
            gameName = gameName.toLowerCase();
            if (!filedata[gameName]) {
                if (cbIsFunc) callback();
                writeResponse(response, 404, {'Content-Type':'text/plain'}, 'Game not found!');
                return;
            }
            if (updates.newname && typeof updates.newname === 'string') {
                var newname = updates.newname.toLowerCase();
                if (newname !== gameName) {
                    filedata[newname] = filedata[gameName];
                    delete filedata[gameName];
                    gameName = newname;
                }
                filedata[gameName].name = updates.newname;
            }
            if (updates.newdescription && typeof updates.newdescription === 'string') {
                filedata[gameName].description = updates.newdescription;
            }
            if (updates.newpublisher && typeof updates.newpublisher === 'string') {
                filedata[gameName].publisher = updates.newpublisher;
            }
            fs.writeFile(datasets[0], JSON.stringify(filedata), 'utf8', function(error) {
                if (cbIsFunc) callback();
                if (error) {
                    console.log(error);
                    writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not create game!');
                } else {
                    writeResponse(response, 200, {'Content-Type':'text/plain'}, 'Successfully updated game.');
                }
            });
        });
    };
    task.fileResource = datasets[0];
    operationQueue.games.enqueue(task);
};

var comments = {};
comments.create = function localCommentsCreate(game, comment, response) {
    function task(callback) {
        var cbIsFunc = typeof callback === 'function';
        fs.readFile(datasets[1], 'utf8', function(error, data) {
            if (error) {
                if (cbIsFunc) callback();
                console.log(error);
                writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not access database!');
                return;
            }
            var filedata = JSON.parse(data);
            if (!filedata.gameComments[game]) {
                filedata.gameComments[game] = [];
            }
            
            filedata.lastCommentID++;
            filedata.gameComments[game].push({
                'id' : filedata.lastCommentID,
                'username' : comment.username,
                'content' : comment.content
            });
            
            fs.writeFile(datasets[1], JSON.stringify(filedata), 'utf8', function(error) {
                if (cbIsFunc) callback();
                if (error) {
                    console.log(error);
                    writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not create comment!');
                } else {
                    writeResponse(response, 201, {'Content-Type':'text/plain'}, 'Successfully created comment.');
                }
            });
        });
    };
    task.fileResource = datasets[1];
    operationQueue.comments.enqueue(task);
};
comments.getByGame = function localCommentsGetByGame(game, response) {
    function task(callback) {
        var cbIsFunc = typeof callback === 'function';
        fs.readFile(datasets[1], 'utf8', function(error, data) {
            if (cbIsFunc) callback();
            if (error) {
                console.log(error);
                writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not access database!');
                return;
            }
            var jsonBuffer = '{"comments":';
            var gameIdx = data.indexOf('"' + game + '":');
            jsonBuffer += (gameIdx > 0) ? (data.slice((gameIdx + game.length + 3), (data.indexOf('"}]', gameIdx) + 3)) + '}') : '[]}';
            writeResponse(response, 200, {'Content-Type':'application/json'}, jsonBuffer);
        });
    };
    task.fileResource = datasets[1];
    operationQueue.comments.enqueue(task);
};
comments.remove = function localCommentsRemove(game, id, response) {
    function task(callback) {
        var cbIsFunc = typeof callback === 'function';
        fs.readFile(datasets[1], 'utf8', function(error, data) {
            if (error) {
                if (cbIsFunc) callback();
                console.log(error);
                writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not access database!');
                return;
            }
            var filedata = JSON.parse(data);
            if (!filedata.gameComments[game]) {
                if (cbIsFunc) callback();
                writeResponse(response, 404, {'Content-Type':'text/plain'}, 'Game title not found!');
                return;
            }
            var commentIdx = binarySearch(filedata.gameComments[game], id, 'id');
            if (commentIdx < 0) {
                if (cbIsFunc) callback();
                writeResponse(response, 404, {'Content-Type':'text/plain'}, 'Comment not found for this game!');
                return;
            }
            filedata.gameComments[game].splice(commentIdx, 1);
            
            fs.writeFile(datasets[1], JSON.stringify(filedata), 'utf8', function(error) {
                if (cbIsFunc) callback();
                if (error) {
                    console.log(error);
                    writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not write changes to database!');
                } else {
                    writeResponse(response, 200, {'Content-Type':'text/plain'}, 'Successfully deleted comment.');
                }
            });
        });
    };
    task.fileResource = datasets[1];
    operationQueue.comments.enqueue(task);
};
comments.update = function localCommentsUpdate(game, updates, response) {
    function task(callback) {
        var cbIsFunc = typeof callback === 'function';
        fs.readFile(datasets[1], 'utf8', function(error, data) {
            if (error) {
                if (cbIsFunc) callback();
                console.log(error);
                writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not access database!');
                return;
            }
            var filedata = JSON.parse(data);
            if (!filedata.gameComments[game]) {
                if (cbIsFunc) callback();
                writeResponse(response, 404, {'Content-Type':'text/plain'}, 'Game title not found!');
                return;
            }
            var commentIdx = binarySearch(filedata.gameComments[game], updates.id, 'id');
            if (commentIdx < 0) {
                if (cbIsFunc) callback();
                writeResponse(response, 404, {'Content-Type':'text/plain'}, 'Comment not found for this game!');
                return;
            }
            filedata.gameComments[game][commentIdx].content = updates.newcontent;
            
            fs.writeFile(datasets[1], JSON.stringify(filedata), 'utf8', function(error) {
                if (cbIsFunc) callback();
                if (error) {
                    console.log(error);
                    writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not update database!');
                } else {
                    writeResponse(response, 200, {'Content-Type':'text/plain'}, 'Successfully updated comment.');
                }
            });
        });
    };
    task.fileResource = datasets[1];
    operationQueue.comments.enqueue(task);
};

var search = {};
search.gameSearch = function localSearchRunSearch(params, response) {
    function task(callback) {
        var cbIsFunc = typeof callback === 'function';
        fs.readFile(datasets[0], 'utf8', function(error, data) {
            if (cbIsFunc) callback();
            if (error) {
                console.log(error);
                writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not access database!');
                return;
            }
            var filedata = JSON.parse(data);
            var matches = [[],[],[],[]];
            var hits;
            for (var game in filedata) {
                hits = 0;
                for (var i = 0; i < params.regexList.length; i++) {
                    if (params.name && params.regexList[i].test(filedata[game].name)) hits += 2;
                    if (params.desc && params.regexList[i].test(filedata[game].description)) hits += 1;
                    if (params.publisher && params.regexList[i].test(filedata[game].publisher)) hits += 1;
                }
                if (hits) matches[hits-1].push(filedata[game]);
            }
            var results = { 'results' : matches[3].concat(matches[2], matches[1], matches[0]) };
            writeResponse(response, 200, {'Content-Type':'application/json'}, JSON.stringify(results));
        });
    };
    task.fileResource = datasets[0];
    operationQueue.games.enqueue(task);
};

module.exports = {
    'initialize' : initializeLocalModel,
    'game'       : game,
    'comments'   : comments,
    'search'     : search
};
