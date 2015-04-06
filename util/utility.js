'use-strict';

//  File for utility functions

function arrBinarySearch(collection, target) {
    if (!Array.isArray(collection)) return -1;
    var valueLocale = [];
    for (var i = 2; i < arguments.length; i++) {
        valueLocale.push(arguments[i]);
    }
    function retrieveValue(index) {
        var value = collection[index];
        for (var i = 0; i < valueLocale.length; i++) {
            if (typeof value !== 'object' && !Array.isArray(value)) {
                return undefined;
            }
            value = value[valueLocale[i]];
        }
        return value;
    };
    function search(first, last) {
        if (first == last) {
            return (target === retrieveValue(first)) ? first : -1;
        }
        var middle = Math.floor((last + 1 - first)/2) + first;
        if (target === retrieveValue(middle)) {
            return middle;
        } else {
            return (target < retrieveValue(middle)) ? search(first, middle - 1) : search(middle, last);
        }
    };
    
    return search(0, collection.length - 1);
};

function writeResponse(res, code, content, resText) {
    res.writeHead(code, content);
    res.write(resText);
    res.end();
};

module.exports = {
    'arrBinarySearch' : arrBinarySearch,
    'writeResponse' : writeResponse
}