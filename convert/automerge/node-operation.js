"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const immutable_1 = require("immutable");
const declare_1 = require("../../declare");
const utils_1 = require("./utils");
function applySplitNodeOperation(automergeValue, operation) {
    const { path, position, properties } = operation;
    splitNode(automergeValue.document, path, position, properties);
}
exports.applySplitNodeOperation = applySplitNodeOperation;
function applyRemoveNodeOperation(automergeValue, operation) {
    const { path } = operation;
    removeNode(automergeValue.document, path);
}
exports.applyRemoveNodeOperation = applyRemoveNodeOperation;
function applyInsertNodeOperation(automergeValue, operation, fixNodeJSON) {
    const { path, node } = operation;
    const nodeJson = fixNodeJSON(node.toJSON());
    insertNode(automergeValue.document, path, nodeJson);
}
exports.applyInsertNodeOperation = applyInsertNodeOperation;
function applySetNodeOperation(automergeValue, operation) {
    const { path, properties } = operation;
    setNode(automergeValue.document, path, properties);
}
exports.applySetNodeOperation = applySetNodeOperation;
function applyMoveNodeOperation(automergeValue, operation) {
    const { path, newPath } = operation;
    if (_.isEqual(path.toArray(), newPath.toArray())) {
        return;
    }
    moveNode(automergeValue.document, path, newPath);
}
exports.applyMoveNodeOperation = applyMoveNodeOperation;
function applyMergeNodeOperation(automergeValue, operation) {
    const { path } = operation;
    mergeNode(automergeValue.document, path);
}
exports.applyMergeNodeOperation = applyMergeNodeOperation;
function splitNode(document, path, position, properties) {
    const resolvedPath = utils_1.resolvePath(path);
    const child = utils_1.assertNode(document, resolvedPath);
    if (!child) {
        return;
    }
    if (child.object === declare_1.SlateObject.text) {
        const [before, after] = utils_1.splitLeaves(child.leaves, position);
        const b = {
            object: declare_1.SlateObject.text,
            leaves: utils_1.createLeaves(after),
        };
        // TODO: 同一段落两次回车会有 bug
        utils_1.replaceLeaves(child.leaves, before);
        insertNode(document, resolvedPath, b, 1);
    }
    else if (child.object === declare_1.SlateObject.block ||
        child.object === declare_1.SlateObject.inline) {
        const after = child.nodes.slice(position);
        const b = utils_1.cloneDeep(Object.assign({}, child, { nodes: after }));
        if (properties) {
            Object.assign(b, mormalizeProperties(properties));
        }
        const delta = child.nodes.length - position;
        child.nodes.splice(position, delta);
        insertNode(document, resolvedPath, b, 1);
    }
}
function insertNode(document, path, node, offset = 0) {
    const resolvedPath = utils_1.resolvePath(path);
    const index = resolvedPath.last();
    const parent = getParent(document, resolvedPath);
    if (parent) {
        // TODO: 这里修复 node 的key，并带上 section id
        fixNodeKey(node, parent);
        parent.nodes.splice(index + offset, 0, node);
    }
}
function removeNode(document, path) {
    // assertDescendant(path)
    const resolvedPath = utils_1.resolvePath(path);
    const index = resolvedPath.last();
    const parent = getParent(document, resolvedPath);
    if (parent) {
        parent.nodes.splice(index, 1);
    }
}
function setNode(document, path, properties) {
    const resolvedPath = utils_1.resolvePath(path);
    const node = utils_1.assertNode(document, resolvedPath);
    if (node) {
        Object.assign(node, mormalizeProperties(properties));
    }
}
function moveNode(document, path, newPath, newIndex = 0) {
    const resolvedPath = utils_1.resolvePath(path);
    let newResolvedPath = utils_1.resolvePath(newPath, newIndex);
    const node = utils_1.assertNode(document, resolvedPath);
    const newParentPath = newResolvedPath.slice(0, -1);
    const parent = utils_1.assertNode(document, immutable_1.List(newParentPath));
    if (!node || !parent) {
        return;
    }
    const [p, np] = crop(resolvedPath, newResolvedPath);
    const position = compare(p, np);
    // If the old path ends above and before a node in the new path, then
    // removing it will alter the target, so we need to adjust the new path.
    if (resolvedPath.size < newResolvedPath.size &&
        position === -1) {
        newResolvedPath = decrement(newResolvedPath, 1, p.size - 1);
    }
    removeNode(document, resolvedPath);
    insertNode(document, newResolvedPath, node);
}
function mergeNode(document, path) {
    const resolvedPath = utils_1.resolvePath(path);
    const b = utils_1.assertNode(document, resolvedPath);
    if (resolvedPath.last() === 0) {
        return;
    }
    const withPath = decrement(resolvedPath);
    const a = utils_1.assertNode(document, withPath);
    if (!a || !b) {
        return;
    }
    if (a.object !== b.object) {
        return;
    }
    const cloneA = utils_1.cloneDeep(a);
    const cloneB = utils_1.cloneDeep(b);
    if (cloneA.object === declare_1.SlateObject.text) {
        cloneA.leaves = utils_1.createLeaves([...cloneA.leaves, ...cloneB.leaves]);
    }
    else if (cloneA.object === declare_1.SlateObject.block ||
        cloneA.object === declare_1.SlateObject.inline) {
        cloneA.nodes = [...cloneA.nodes, ...cloneB.nodes];
    }
    removeNode(document, resolvedPath);
    removeNode(document, withPath);
    insertNode(document, withPath, cloneA);
}
function getParent(document, path) {
    const resolvedPath = utils_1.resolvePath(path);
    const parentPath = immutable_1.List(resolvedPath.slice(0, -1));
    return utils_1.assertNode(document, parentPath);
}
function mormalizeProperties(properties) {
    const result = {};
    _.forOwn(properties, (value, key) => {
        if (immutable_1.List.isList(value)) {
            result[key] = value.toArray();
        }
        else if (immutable_1.Map.isMap(value)) {
            result[key] = value.toObject();
        }
        else {
            result[key] = value;
        }
    });
    return result;
}
function crop(a, b, size = Math.min(a.size, b.size)) {
    const ca = immutable_1.List(a.slice(0, size));
    const cb = immutable_1.List(b.slice(0, size));
    return [ca, cb];
}
function compare(path, target) {
    const m = Math.min(path.size, target.size);
    for (let i = 0; i < m; i++) {
        const pv = path.get(i);
        const tv = target.get(i);
        // If the path's value is ever less than the target's, it's before.
        if (pv < tv) {
            return -1;
        }
        // If the target's value is ever less than the path's, it's after.
        if (pv > tv) {
            return 1;
        }
    }
    // Paths should now be equal, otherwise something is wrong
    return path.size === target.size ? 0 : null;
}
function decrement(path, n = 1, index = path.size - 1) {
    return increment(path, 0 - n, index);
}
function increment(path, n = 1, index = path.size - 1) {
    const value = path.get(index);
    const newValue = value + n;
    const newPath = path.set(index, newValue);
    return newPath;
}
function fixNodeKey(node, parent) {
    if (parent.object === declare_1.SlateObject.document &&
        node.object === declare_1.SlateObject.block) {
        // node.key = `createSection_${ uuid() }`
    }
    else {
        const n = node;
        delete n.key;
    }
}
