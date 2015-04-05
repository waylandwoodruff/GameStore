'use-strict';

var fs = require('fs');

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
    for (var i = 0; i < datasets.length; i++) {
        try {
            fd = fs.openSync(datasets[i], 'wx+');
            fs.appendFileSync(datasets[i], initJSON[datasets[i]]);
            fs.closeSync(fd);
        } catch(e) { if (e.code !== 'EEXIST') console.log(e); }
    }
};

function writeResponse(res, code, content, resText) {
    res.writeHead(code, content);
    res.write(resText);
    res.end();
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
            if (error) {
                if (cbIsFunc) callback();
                console.log(error);
                writeResponse(response, 500, {'Content-Type':'text/plain'}, 'Could not access database!');
                return;
            }
            var gameIndex = data.indexOf('"' + name.toLowerCase() + '":{');
            if (gameIndex < 0) {
                if (cbIsFunc) callback();
                writeResponse(response, 404, {'Content-Type':'text/plain'}, 'Game not found.');
                return;
            }
            var gameJSON = data.slice(data.indexOf('{', gameIndex), (1 + data.indexOf('}', gameIndex)));
            if (cbIsFunc) callback();
            writeResponse(response, 200, {'Content-Type':'application/json'}, gameJSON);
        });
    };
    task.fileResource = datasets[0];
    operationQueue.games.enqueue(task);
};
game.update = function localGameUpdate(name, updates) {
    //  updates is expected to be an object where keys are metadata names
};

var comments = {};
comments.create = function localCommentsCreate(game, comment) {
    operationQueue.comments.enqueue(function() {
        fs.readFile(datasets[1], 'utf8', function(error, data) {
            if (error) {
                console.log(error);
                return;
            }
            var filedata = JSON.parse(data);
            if (!filedata.gameComments[game]) {
                filedata.gameComments[game] = [];
            }
            filedata.lastCommentID++;
            comment.id = filedata.lastCommentID;
            comment.timestamp = +((new Date()).getTime());
            filedata.gameComments[game].push(comment);
            fs.writeFile(datasets[1], JSON.stringify(filedata), 'utf8', function(error) {
                if (error) {
                    console.log(error);
                }
            });
        });
    });
};
comments.getByGame = function localCommentsGetByGame(game) {};
comments.remove = function localCommentsRemove(game /* parameters? */) {};
comments.update = function localCommentsUpdate(game, updates) {};

var search = {};

module.exports = {
    'initialize' : initializeLocalModel,
    'game' : game,
    'comments' : comments,
    'search' : search
};