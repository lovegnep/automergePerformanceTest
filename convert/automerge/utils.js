"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
const _ = require("lodash");
const declare_1 = require("../../declare");
function cloneDeep(value) {
    return JSON.parse(JSON.stringify(value));
}
exports.cloneDeep = cloneDeep;
function assertNode(documentNode, path) {
    let currentNode = documentNode;
    path.toArray().forEach((index) => {
        if (currentNode.object === declare_1.SlateObject.document ||
            currentNode.object === declare_1.SlateObject.block ||
            currentNode.object === declare_1.SlateObject.inline) {
            currentNode = currentNode.nodes[index];
        }
    });
    return currentNode;
}
exports.assertNode = assertNode;
function resolvePath(path, index) {
    if (typeof path === 'string') {
        // path = this.getPath(path)
        path = immutable_1.List();
        if (index != null) {
            path = immutable_1.List(path.concat(index));
        }
    }
    else {
        path = createPath(path);
    }
    return path;
}
exports.resolvePath = resolvePath;
function createPath(attrs) {
    if (attrs == null) {
        return null;
    }
    if (immutable_1.List.isList(attrs)) {
        return attrs;
    }
    if (Array.isArray(attrs)) {
        return immutable_1.List(attrs);
    }
    return;
}
function getText(textNode) {
    const text = textNode.leaves.reduce((memo, leaf) => {
        return memo + leaf.text.join('');
    }, '');
    return text;
}
exports.getText = getText;
function searchLeafAtOffset(leaves, offset) {
    let endOffset = 0;
    let startOffset = 0;
    let index = -1;
    for (const leaf of leaves) {
        index++;
        startOffset = endOffset;
        endOffset = startOffset + leaf.text.length;
        if (endOffset >= offset) {
            break;
        }
    }
    return {
        leaf: leaves[index],
        endOffset,
        index,
        startOffset,
    };
}
exports.searchLeafAtOffset = searchLeafAtOffset;
function splitLeaves(leaves, offset) {
    const nextLeaves = cloneDeep(leaves);
    if (offset < 0) {
        return [[], nextLeaves];
    }
    if (nextLeaves.length === 0) {
        return [[], []];
    }
    let endOffset = 0;
    let index = -1;
    let left;
    let right;
    nextLeaves.find((leaf) => {
        index++;
        const startOffset = endOffset;
        const { text } = leaf;
        endOffset += text.length;
        if (endOffset < offset) {
            return false;
        }
        if (startOffset > offset) {
            return false;
        }
        const length = offset - startOffset;
        left = creatLeaf(text.slice(0, length), leaf.marks);
        right = creatLeaf(text.slice(length), leaf.marks);
        return true;
    });
    if (!left) {
        return [nextLeaves, []];
    }
    if (!right) {
        return [[], nextLeaves];
    }
    if (left.text.join('') === '') {
        if (index === 0) {
            return [[left], nextLeaves];
        }
        return [nextLeaves.slice(0, index), nextLeaves.slice(index)];
    }
    if (right.text.join('') === '') {
        if (index === nextLeaves.length - 1) {
            return [nextLeaves, [right]];
        }
        return [nextLeaves.slice(0, index + 1), nextLeaves.slice(index + 1)];
    }
    return [
        [...nextLeaves.slice(0, index), left],
        [right, ...nextLeaves.slice(index + 1)],
    ];
}
exports.splitLeaves = splitLeaves;
function creatLeaf(text = [], marks = []) {
    const fixedText = typeof text === 'string' ? text.split('') : text;
    return {
        marks: cloneDeep(marks),
        text: cloneDeep(fixedText),
        object: declare_1.SlateObject.leaf,
    };
}
exports.creatLeaf = creatLeaf;
function createLeaves(leaves) {
    const nextLeaves = cloneDeep(leaves);
    if (nextLeaves.length <= 1) {
        return leaves;
    }
    let invalid = false;
    const result = [];
    const reversedLeaves = nextLeaves.slice(0).reverse();
    // Search from the leaves left end to find invalid node;
    reversedLeaves.forEach((leaf, _index) => {
        const firstLeaf = result[0];
        // If the first leaf of result exist, check whether the first leaf is connectable with the current leaf
        if (firstLeaf) {
            // If marks equals, then the two leaves can be connected
            if (_.isEqual(firstLeaf.marks, leaf.marks)) {
                invalid = true;
                firstLeaf.text = [...leaf.text, ...firstLeaf.text];
                return;
            }
            // If the cached leaf is empty, drop the empty leaf with the upcoming leaf
            if (firstLeaf.text.join('') === '') {
                invalid = true;
                result[0] = leaf;
                return;
            }
            // If the current leaf is empty, drop the leaf
            if (leaf.text.join('') === '') {
                invalid = true;
                return;
            }
        }
        result.unshift(leaf);
    });
    if (!invalid) {
        return leaves;
    }
    return result;
}
exports.createLeaves = createLeaves;
function replaceLeaves(leaves, nextLeaves) {
    if (nextLeaves === leaves) {
        return;
    }
    makeArrayLengthEqual(leaves, nextLeaves);
    if (leaves.length === nextLeaves.length) {
        for (const [index, leaf] of leaves.entries()) {
            const nextLeaf = nextLeaves[index];
            if (!_.isEqual(leaf, nextLeaf)) {
                replaceLeaf(Reflect.get(leaves, index), nextLeaf);
            }
        }
    }
    else {
        leaves = nextLeaves;
    }
}
exports.replaceLeaves = replaceLeaves;
function replaceLeaf(leaf, nextLeaf) {
    if (!_.isEqual(leaf.marks, nextLeaf.marks)) {
        replaceMarks(leaf.marks, nextLeaf.marks);
    }
    if (!_.isEqual(leaf.text, nextLeaf.text)) {
        replaceText(leaf.text, nextLeaf.text);
    }
}
function replaceMarks(marks, nextMarks) {
    makeArrayLengthEqual(marks, nextMarks);
    if (marks.length === nextMarks.length) {
        for (const [index, mark] of marks.entries()) {
            const nextMark = nextMarks[index];
            if (!_.isEqual(mark, nextMark)) {
                if (mark.type !== nextMark.type) {
                    marks[index].type = nextMark.type;
                }
                if (!_.isEqual(mark.data, nextMark.data)) {
                    Object.assign(marks[index].data, nextMark.data);
                }
            }
        }
    }
    else {
        marks = nextMarks;
    }
}
function replaceText(text, nextText) {
    makeArrayLengthEqual(text, nextText);
    if (text.length === nextText.length) {
        for (const [index, str] of text.entries()) {
            const nextStr = nextText[index];
            if (str !== nextStr) {
                text[index] = nextStr;
            }
        }
    }
    else {
        text = nextText;
    }
}
function makeArrayLengthEqual(current, next) {
    const start = getContinuousEqualIndex(current, next);
    const reverse = current.slice(0).reverse();
    const reverseNext = next.slice(0).reverse();
    const end = current.length - getContinuousEqualIndex(reverse, reverseNext);
    const delta = next.length - current.length;
    if (delta > 0) {
        // 增加元素
        const diff = next.slice(end, end + delta);
        current.splice(end, 0, ...diff);
    }
    else if (delta < 0) {
        // 移除元素
        current.splice(start, -delta);
    }
}
function getContinuousEqualIndex(current, next) {
    let start = 0;
    for (const [index, item] of current.entries()) {
        const nextItem = next[index];
        start = index;
        if (!_.isEqual(item, nextItem)) {
            break;
        }
    }
    return start;
}
