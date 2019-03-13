"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const slate_1 = require("slate");
const declare_1 = require("../../declare");
const declare_2 = require("../../declare");
const SectionModel_1 = require("../../section/SectionModel");
function parseEntity(inline, offset) {
    const { type, text } = inline;
    const data = inline.data.toObject();
    const extraData = _.omit(data, 'mutability');
    return {
        type,
        offset,
        length: text.length,
        mutability: data.mutability || declare_1.InlineDataMutability.Mutable,
        data: extraData,
    };
}
function mergeTheSameStyleRange(ranges) {
    const results = [];
    if (ranges.length <= 1) {
        return ranges;
    }
    let current = ranges[0];
    const len = ranges.length;
    for (let i = 1; i < len; i++) {
        const rang = ranges[i];
        if (current.offset + current.length === rang.offset) {
            // 如果是连续的 style 样式，合并成一个
            current.length += rang.length;
        }
        else {
            // 如果不是连续的 style 样式，分开成两个描述
            results.push(current);
            current = rang;
        }
    }
    results.push(current);
    return results;
}
function mergeStyleRanges(ranges) {
    if (ranges.length <= 1) {
        return ranges;
    }
    const groupedRanges = _.groupBy(ranges, 'style');
    const mergedRanges = _.map(groupedRanges, (arr) => mergeTheSameStyleRange(arr));
    return _.flatten(mergedRanges);
}
function parseInlineStyles(text, offset) {
    const styles = [];
    let tempOffset = 0;
    for (const leaf of text.leaves.toArray()) {
        const length = leaf.text.length;
        for (const mark of leaf.marks.toArray()) {
            styles.push({
                offset: offset + tempOffset,
                length,
                style: mark.type,
            });
        }
        tempOffset += length;
    }
    return styles;
}
function parseTextRange(node, offset = 0) {
    const entities = [];
    const inlineStyleRanges = [];
    if (node.object === declare_1.SlateObject.inline) {
        // 解析当前节点的 inline 描述
        entities.push(parseEntity(node, offset));
    }
    else if (node.object === declare_1.SlateObject.text) {
        // 解析当前节点的 style 描述
        inlineStyleRanges.push(...parseInlineStyles(node, offset));
    }
    // 解析子孙节点的文字描述
    if (node.object === declare_1.SlateObject.inline || node.object === declare_1.SlateObject.block) {
        const children = node.nodes.toArray();
        let tempOffset = 0;
        for (const child of children) {
            const childRange = parseTextRange(child, offset + tempOffset);
            entities.push(...childRange.entities);
            inlineStyleRanges.push(...childRange.inlineStyleRanges);
            tempOffset += child.text.length;
        }
    }
    return { entities, inlineStyleRanges };
}
function extractNodes(block) {
    return block.nodes.toArray().map((child) => {
        if (slate_1.Block.isBlock(child)) {
            const hasBlockChild = !!child.getBlocks().size;
            const convertedNode = convertNode(child);
            const fixedNode = convertedNode ? omitUnnecessaryProperty(convertedNode) : { type: child.type };
            if (hasBlockChild) {
                return Object.assign({}, fixedNode, { nodes: extractNodes(child) });
            }
            else {
                return fixedNode;
            }
        }
        return null;
    });
}
function omitUnnecessaryProperty(block) {
    return _.pickBy(block, (value, key) => {
        // 过滤掉一些不必要存储的属性
        if (key === 'key' ||
            (key === 'type' && value === declare_1.SlateBlockType.paragraph) ||
            (key === 'data' && _.isEqual(value, {})) ||
            (key === 'text' && value === '') ||
            (key === 'entities' && _.isEqual(value, [])) ||
            (key === 'inlineStyleRanges' && _.isEqual(value, []))) {
            return false;
        }
        return true;
    });
}
function convertNode(node) {
    const type = node.type;
    if (declare_2.isHelpBlock(type)) {
        return {
            key: node.key,
            type: node.type,
            data: node.data.toObject(),
            text: node.text,
        };
    }
    else if (declare_2.isParentBlock(type)) {
        return {
            key: node.key,
            type: node.type,
            data: node.data.toObject(),
            nodes: extractNodes(node),
        };
    }
    else if (declare_2.isTextBlock(type)) {
        const { entities, inlineStyleRanges } = parseTextRange(node);
        return {
            key: node.key,
            type: node.type,
            data: node.data.toObject(),
            text: node.text,
            entities,
            inlineStyleRanges: mergeStyleRanges(inlineStyleRanges),
        };
    }
    else {
        return {
            key: node.key,
            type: node.type,
            data: node.data.toObject(),
        };
    }
}
function* iterateBlockNodes(nodes) {
    for (const node of nodes) {
        if (node.object !== declare_1.SlateObject.block) {
            continue;
        }
        yield node;
        // 如果是表格、列表等嵌套结构，停止递归
        if (!declare_2.isParentBlock(node.type)) {
            const children = node.nodes.toArray();
            yield* iterateBlockNodes(children);
        }
    }
}
function convertToSections(value) {
    const sections = [];
    const iterator = iterateBlockNodes(value.document.nodes.toArray());
    for (const node of iterator) {
        const item = convertNode(node);
        item && sections.push(new SectionModel_1.default(item));
    }
    return sections;
}
exports.convertToSections = convertToSections;
