"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function limit(val, min, max) {
    return Math.min(Math.max(val, min), max);
}
exports.limit = limit;
exports.omitEmpty = (target) => {
    return _.omitBy(target, (value) => {
        if (_.isPlainObject(value) || _.isArray(value)) {
            return _.isEmpty(value);
        }
        else {
            return !value;
        }
    });
};
exports.removeLineBreaks = (str) => {
    return str.replace(/[\r\n]/g, '');
};
exports.filterData = (data) => {
    return !!data;
};
exports.findUntil = (arr, predicate, fromIndex = 0) => {
    const range = arr.slice(fromIndex);
    const result = [];
    for (const [key, value] of range.entries()) {
        if (predicate(value, key, range)) {
            result.push(value);
        }
        else {
            return result;
        }
    }
    return result;
};
