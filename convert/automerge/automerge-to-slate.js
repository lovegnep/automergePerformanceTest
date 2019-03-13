"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slate_1 = require("slate");
const declare_1 = require("../../declare");
function automergeToSlateValue(automergeValue) {
    if (automergeValue) {
        const json = fixAutomergeJSON(automergeValue);
        return slate_1.Value.fromJSON(json);
    }
    else {
        return slate_1.Value.fromJSON({});
    }
}
exports.automergeToSlateValue = automergeToSlateValue;
function fixAutomergeJSON(json) {
    const newJson = {};
    for (const [key, value] of Object.entries(json)) {
        if (json.object === declare_1.SlateObject.leaf &&
            key === 'text' &&
            Array.isArray(value)) {
            newJson[key] = value.join('');
        }
        else if (Array.isArray(value)) {
            newJson[key] = value.map((v) => fixAutomergeJSON(v));
        }
        else if (typeof value === 'object') {
            newJson[key] = fixAutomergeJSON(value);
        }
        else {
            newJson[key] = value;
        }
    }
    const tmpjson = json;
    if (json.object === 'block') {
        newJson.key = tmpjson._objectId;
    }
    return newJson;
}
