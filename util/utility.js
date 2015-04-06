'use-strict';

//  File for utility functions

function writeResponse(res, code, content, resText) {
    res.writeHead(code, content);
    res.write(resText);
    res.end();
};

module.exports = {
    'writeResponse' : writeResponse
}