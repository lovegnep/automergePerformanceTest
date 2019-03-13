"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const declare_1 = require("../../declare");
const text_operation_1 = require("./text-operation");
const mark_operation_1 = require("./mark-operation");
const node_operation_1 = require("./node-operation");
function applyOperationsToAutomerge(automergeValue, operations) {
    operations.forEach((operation) => {
        applyOperation(automergeValue, operation);
    });
}
exports.applyOperationsToAutomerge = applyOperationsToAutomerge;
function applyOperation(automergeValue, operation) {
    switch (operation.type) {
        case 'add_mark': {
            mark_operation_1.applyAddMarkOperation(automergeValue, operation);
            break;
        }
        case 'insert_node': {
            node_operation_1.applyInsertNodeOperation(automergeValue, operation, fixSlateJSON);
            break;
        }
        case 'insert_text': {
            text_operation_1.applyInsertTextOperation(automergeValue, operation);
            break;
        }
        case 'merge_node': {
            node_operation_1.applyMergeNodeOperation(automergeValue, operation);
            break;
        }
        case 'move_node': {
            node_operation_1.applyMoveNodeOperation(automergeValue, operation);
            break;
        }
        case 'remove_mark': {
            mark_operation_1.applyRemoveMarkOperation(automergeValue, operation);
            break;
        }
        case 'remove_node': {
            node_operation_1.applyRemoveNodeOperation(automergeValue, operation);
            break;
        }
        case 'remove_text': {
            text_operation_1.applyRemoveTextOperation(automergeValue, operation);
            break;
        }
        // case 'set_mark': {
        //   const { path, offset, length, mark, properties } = operation
        //   const next = value.setMark(path, offset, length, mark, properties)
        //   break
        // }
        case 'set_node': {
            node_operation_1.applySetNodeOperation(automergeValue, operation);
            break;
        }
        // case 'set_selection': {
        //   const { properties } = operation
        //   const next = value.setSelection(properties)
        //   break
        // }
        // case 'set_value': {
        //   const { properties } = operation
        //   const next = value.setProperties(properties)
        //   break
        // }
        case 'split_node': {
            node_operation_1.applySplitNodeOperation(automergeValue, operation);
            break;
        }
        // default: {
        //   throw new Error(`Unknown operation type: "${type}".`)
        // }
    }
}
function slateToAutomergeValue(value) {
    const json = fixSlateJSON(value.toJSON());
    return json;
}
exports.slateToAutomergeValue = slateToAutomergeValue;
function fixSlateJSON(json) {
    const newJson = {};
    for (const [key, value] of Object.entries(json)) {
        if (json.object === declare_1.SlateObject.leaf &&
            key === 'text' &&
            typeof value === 'string') {
            newJson[key] = value.split('');
        }
        else if (Array.isArray(value)) {
            newJson[key] = value.map((v) => fixSlateJSON(v));
        }
        else if (typeof value === 'object') {
            newJson[key] = fixSlateJSON(value);
        }
        else {
            newJson[key] = value;
        }
    }
    return newJson;
}
