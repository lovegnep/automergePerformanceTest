"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const declare_1 = require("../../declare");
const utils_1 = require("./utils");
function applyAddMarkOperation(automergeValue, operation) {
    const { path, offset, length, mark } = operation;
    const resolvedPath = utils_1.resolvePath(path);
    const textNode = utils_1.assertNode(automergeValue.document, resolvedPath);
    const nextMark = mark.toJSON();
    if (textNode && textNode.object === declare_1.SlateObject.text) {
        addMarksToText(textNode, offset, length, [nextMark]);
    }
}
exports.applyAddMarkOperation = applyAddMarkOperation;
function applyRemoveMarkOperation(automergeValue, operation) {
    const { path, offset, length, mark } = operation;
    const resolvedPath = utils_1.resolvePath(path);
    const textNode = utils_1.assertNode(automergeValue.document, resolvedPath);
    const nextMark = mark.toJSON();
    if (textNode && textNode.object === declare_1.SlateObject.text) {
        removeMarkToText(textNode, offset, length, nextMark);
    }
}
exports.applyRemoveMarkOperation = applyRemoveMarkOperation;
function removeMarkToText(textNode, index, length, mark) {
    const text = utils_1.getText(textNode);
    const { leaves } = textNode;
    if (text === '' && index === 0 && length === 0) {
        const first = leaves[0];
        if (!first) {
            return;
        }
        const clone = utils_1.cloneDeep(first);
        const nextLeaf = utils_1.creatLeaf(clone.text, clone.marks.filter((m) => !_.isEqual(m, mark)));
        utils_1.replaceLeaves(leaves, [nextLeaf]);
        return;
    }
    if (length <= 0) {
        return;
    }
    if (index >= text.length) {
        return;
    }
    const [before, bundle] = utils_1.splitLeaves(leaves, index);
    const [middle, after] = utils_1.splitLeaves(bundle, length);
    const nextMiddle = middle.map((leaf) => {
        return utils_1.creatLeaf(leaf.text, leaf.marks.filter((m) => !_.isEqual(m, mark)));
    });
    const nextLeaves = utils_1.createLeaves([...before, ...nextMiddle, ...after]);
    utils_1.replaceLeaves(leaves, nextLeaves);
}
function addMarksToText(textNode, index, length, set) {
    const text = utils_1.getText(textNode);
    const { leaves } = textNode;
    if (text === '' && length === 0 && index === 0) {
        const first = leaves[0];
        let nextLeaf;
        if (!first) {
            nextLeaf = utils_1.creatLeaf('', set);
        }
        else {
            const clone = utils_1.cloneDeep(first);
            nextLeaf = utils_1.creatLeaf(clone.text, _.unionWith(clone.marks, set, _.isEqual));
        }
        utils_1.replaceLeaves(leaves, [nextLeaf]);
        return;
    }
    if (text === '') {
        return;
    }
    if (length === 0) {
        return;
    }
    if (index >= text.length) {
        return;
    }
    const [before, bundle] = utils_1.splitLeaves(leaves, index);
    const [middle, after] = utils_1.splitLeaves(bundle, length);
    const nextMiddle = middle.map((leaf) => {
        return utils_1.creatLeaf(leaf.text, _.unionWith(leaf.marks, set, _.isEqual));
    });
    const nextLeaves = utils_1.createLeaves([...before, ...nextMiddle, ...after]);
    utils_1.replaceLeaves(leaves, nextLeaves);
}
