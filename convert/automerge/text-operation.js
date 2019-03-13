"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const _ = require("lodash");
const declare_1 = require("../../declare");
const utils_1 = require("./utils");
function applyInsertTextOperation(automergeValue, operation) {
    const { path, offset, text, marks } = operation;
    const resolvedPath = utils_1.resolvePath(path);
    const textNode = utils_1.assertNode(automergeValue.document, resolvedPath);
    const nextMarks = (marks || immutable_1.Set()).toArray().map((m) => m.toJSON());
    if (textNode && textNode.object === declare_1.SlateObject.text) {
        insertText(textNode, offset, text, nextMarks);
    }
}
exports.applyInsertTextOperation = applyInsertTextOperation;
function insertText(textNode, offset, text, marks) {
    const { leaves } = textNode;
    const nextText = text.split('');
    if (text.length === 0) {
        return;
    }
    const { startOffset, leaf, index } = utils_1.searchLeafAtOffset(leaves, offset);
    if (!leaf) {
        return;
    }
    const delta = offset - startOffset;
    const beforeText = leaf.text.slice(0, delta);
    const afterText = leaf.text.slice(delta);
    if (_.isEqual(leaf.marks, marks)) {
        leaf.text.splice(delta, 0, ...nextText);
    }
    else {
        // TODO: 这里有一定优化空间
        leaves.splice(index, 1, utils_1.creatLeaf(beforeText, leaf.marks), utils_1.creatLeaf(nextText, marks), utils_1.creatLeaf(afterText, leaf.marks));
        const nextLeaves = utils_1.createLeaves(leaves);
        utils_1.replaceLeaves(leaves, nextLeaves);
    }
}
function applyRemoveTextOperation(automergeValue, operation) {
    const { path, offset, text } = operation;
    const resolvedPath = utils_1.resolvePath(path);
    const textNode = utils_1.assertNode(automergeValue.document, resolvedPath);
    if (textNode && textNode.object === declare_1.SlateObject.text) {
        removeText(textNode, offset, text);
    }
}
exports.applyRemoveTextOperation = applyRemoveTextOperation;
function removeText(textNode, offset, text) {
    const { leaves } = textNode;
    const length = text.length;
    const start = offset;
    if (length <= 0) {
        return;
    }
    if (start >= utils_1.getText(textNode).length) {
        return;
    }
    // PERF: For simple backspace, we can operate directly on the leaf
    if (length === 1) {
        const { leaf, index, startOffset } = utils_1.searchLeafAtOffset(leaves, start + 1);
        const delta = start - startOffset;
        if (leaf) {
            if (leaf.text.length === 1 && leaves.length > 1) {
                leaves.splice(index, 1);
                const nextLeaves = utils_1.createLeaves(leaves);
                utils_1.replaceLeaves(leaves, nextLeaves);
            }
            else {
                leaf.text.splice(delta, length);
            }
        }
    }
    else {
        const [before, bundle] = utils_1.splitLeaves(leaves, start);
        const after = utils_1.splitLeaves(bundle, length)[1];
        const nextLeaves = utils_1.createLeaves([...before, ...after]);
        utils_1.replaceLeaves(leaves, nextLeaves);
    }
}
