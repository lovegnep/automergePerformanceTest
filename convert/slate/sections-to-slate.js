"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const slate_1 = require("slate");
const declare_1 = require("../../declare");
const declare_2 = require("../../declare");
const SectionModel_1 = require("../../section/SectionModel");
const declare_3 = require("../../declare");
// 从 title 解析成 slate title node
function convertTitle(title) {
    return {
        key: declare_1.TITLE_KEY,
        object: declare_2.SlateObject.block,
        type: declare_2.SlateBlockType.title,
        nodes: [{
                object: declare_2.SlateObject.text,
                leaves: [{ object: declare_2.SlateObject.leaf, text: title }],
            }],
    };
}
function createRangeJoinFilter(start, end) {
    return (range) => {
        return (range.offset <= end) && (start <= range.offset + range.length);
    };
}
function createRangeIncludeFilter(start, end) {
    return (range) => {
        return (range.offset <= start) && (end <= range.offset + range.length);
    };
}
function convertLeaves(blockText, start, end, styles) {
    const textRangeFilter = createRangeJoinFilter(start, end);
    const somestyles = styles.filter(textRangeFilter);
    if (!somestyles.length) {
        return [{
                object: declare_2.SlateObject.leaf,
                text: blockText.slice(start, end),
            }];
    }
    const leaves = [];
    const pointSet = new Set([start, end]);
    for (const style of somestyles) {
        const tempStart = style.offset;
        if (start < tempStart && !pointSet.has(tempStart)) {
            pointSet.add(tempStart);
        }
        const tempEnd = style.offset + style.length;
        if (tempEnd < end && !pointSet.has(tempEnd)) {
            pointSet.add(tempEnd);
        }
    }
    const points = _.sortBy(Array.from(pointSet));
    const max = points.length;
    let previous = points[0];
    for (let i = 1; i < max; i++) {
        const current = points[i];
        const tempFilter = createRangeIncludeFilter(previous, current);
        const tempStyles = somestyles.filter(tempFilter);
        const marks = tempStyles.map((style) => ({ type: style.style }));
        leaves.push({
            object: declare_2.SlateObject.leaf,
            text: blockText.slice(previous, current),
            marks,
        });
        previous = current;
    }
    return leaves;
}
function convertInline(text, offset, entity, styles, relatedMap) {
    const { data, mutability, length } = entity;
    const childEntities = (relatedMap.get(entity) || []).sort((a, b) => a.offset - b.offset);
    const nodes = convertEntitiesAndStyles(text, offset, offset + length, childEntities, styles, relatedMap);
    return {
        object: declare_2.SlateObject.inline,
        type: entity.type,
        data: Object.assign({}, data, { mutability }),
        nodes,
    };
}
function convertSection(section) {
    const type = section.type;
    if (declare_3.isParentBlock(type)) {
        const bottomType = declare_3.getBottomType(type);
        const nodes = declare_3.isWrapperBlock(type) ? convertChildNodes(section) : convertDescendantNodes(section, bottomType);
        return {
            key: section.key,
            object: declare_2.SlateObject.block,
            type: section.type,
            data: section.data,
            nodes,
        };
    }
    else {
        const data = Object.assign({}, section.data);
        const text = section.text;
        const styles = _.sortBy(section.inlineStyleRanges, 'offset');
        const entities = _.sortBy(section.entities, 'offset');
        const nodes = convertSectionEntitiesAndStyles(text, entities, styles);
        return {
            key: section.key,
            object: declare_2.SlateObject.block,
            type,
            data,
            nodes,
        };
    }
}
function convertSectionEntitiesAndStyles(text, entities, styles) {
    const relatedMap = new Map();
    const parentEntities = entities.filter((current) => {
        const parents = [];
        for (const tmp of entities) {
            if (tmp === current) {
                continue;
            }
            if (
            // 如果当前节点已经是父节点，则不能再为子节点
            // 针对的场景是 offset length 相等
            !relatedMap.get(current) &&
                current.offset >= tmp.offset &&
                current.offset + current.length <= tmp.offset + tmp.length) {
                parents.push(tmp);
            }
        }
        if (parents.length) {
            const parent = parents.sort((a, b) => b.offset - a.offset)[0];
            const children = relatedMap.get(parent) || [];
            relatedMap.set(parent, children.concat(current));
            return false;
        }
        else {
            return true;
        }
    });
    return convertEntitiesAndStyles(text, 0, text.length, parentEntities, styles, relatedMap);
}
function convertEntitiesAndStyles(text, start, end, entities, styles, relatedMap) {
    const nodes = [];
    if (!entities.length) {
        nodes.push({
            object: declare_2.SlateObject.text,
            leaves: convertLeaves(text, start, end, styles),
        });
    }
    else {
        const emptyTextNode = {
            object: declare_2.SlateObject.text,
            leaves: [{
                    object: declare_2.SlateObject.leaf,
                    text: '',
                }],
        };
        let offset = start;
        for (const entity of entities) {
            const entityOffset = entity.offset;
            const entityLength = entity.length;
            if (offset !== entityOffset) {
                nodes.push({
                    object: declare_2.SlateObject.text,
                    leaves: convertLeaves(text, offset, entityOffset, styles),
                });
                offset = entityOffset;
            }
            else {
                // 当 inline 前面没有 text 内容时，插入一个空的 text 节点
                nodes.push(emptyTextNode);
            }
            nodes.push(convertInline(text, offset, entity, styles, relatedMap));
            offset += entityLength;
        }
        if (offset !== end) {
            nodes.push({
                object: declare_2.SlateObject.text,
                leaves: convertLeaves(text, offset, end, styles),
            });
        }
        else {
            // 当 inline 后面没有 text 内容时，插入一个空的 text 节点
            nodes.push(emptyTextNode);
        }
    }
    return nodes;
}
function convertRemoteBlockToSection(block) {
    const { type, data, nodes, text, entities, inlineStyleRanges } = block;
    return new SectionModel_1.default({
        type: type || declare_2.SlateBlockType.paragraph,
        nodes: nodes || [],
        text: text || '',
        data: data || {},
        entities: entities || [],
        inlineStyleRanges: inlineStyleRanges || [],
    });
}
function convertChildSections(sections) {
    return sections.map((section) => {
        return convertSection(section);
    });
}
exports.convertChildSections = convertChildSections;
function convertChildNodes(section) {
    if (section.nodes) {
        const sections = section.nodes.map((node) => {
            return convertRemoteBlockToSection(node);
        });
        return convertChildSections(sections);
    }
    else {
        return [{
                object: declare_2.SlateObject.block,
                type: declare_2.SlateBlockType.paragraph,
            }];
    }
}
function convertDescendantNodes(section, bottomType) {
    return section.nodes.map((child) => {
        if (child.type === bottomType) {
            return {
                object: declare_2.SlateObject.block,
                type: child.type,
                nodes: convertChildNodes(child),
            };
        }
        else {
            const childSection = convertRemoteBlockToSection(child);
            return {
                object: declare_2.SlateObject.block,
                type: child.type,
                nodes: convertDescendantNodes(childSection, bottomType),
            };
        }
    });
}
function convertOrderedListItems(sections) {
    const nodes = sections
        .filter((section) => section.type === declare_2.SlateBlockType.orderedListItem)
        .map((section) => convertSection(section));
    return {
        object: declare_2.SlateObject.block,
        type: declare_2.SlateBlockType.orderedListWrapper,
        nodes,
    };
}
function convertUnorderedListItems(sections) {
    const nodes = sections
        .filter((section) => section.type === declare_2.SlateBlockType.unorderedListItem)
        .map((section) => convertSection(section));
    return {
        object: declare_2.SlateObject.block,
        type: declare_2.SlateBlockType.unorderedListWrapper,
        nodes,
    };
}
function convertCode(sections) {
    const nodes = [];
    const codeSections = sections.filter((section) => {
        return section.type === declare_2.SlateBlockType.code;
    });
    codeSections.forEach((section) => {
        const text = section.text;
        const lines = text.split('\n');
        lines.forEach((line) => {
            nodes.push({
                key: section.key + _.uniqueId(),
                object: declare_2.SlateObject.block,
                type: declare_2.SlateBlockType.code,
                nodes: [{
                        object: declare_2.SlateObject.text,
                        leaves: [{
                                object: declare_2.SlateObject.leaf,
                                text: line,
                            }],
                    }],
            });
        });
    });
    return {
        object: declare_2.SlateObject.block,
        type: declare_2.SlateBlockType.codeWrapper,
        nodes,
    };
}
function convertBlockquote(sections) {
    const nodes = sections
        .filter((section) => section.type === declare_2.SlateBlockType.blockquote)
        .map((section) => convertSection(section));
    return {
        object: declare_2.SlateObject.block,
        type: declare_2.SlateBlockType.blockquoteWrapper,
        nodes,
    };
}
const chunkTypes = [
    declare_2.SlateBlockType.blockquote,
    declare_2.SlateBlockType.orderedListItem,
    declare_2.SlateBlockType.unorderedListItem,
    declare_2.SlateBlockType.code,
];
function convertSectionChunk(chunk) {
    switch (chunk.type) {
        case declare_2.SlateBlockType.orderedListItem:
            return convertOrderedListItems(chunk.sections);
        case declare_2.SlateBlockType.unorderedListItem:
            return convertUnorderedListItems(chunk.sections);
        case declare_2.SlateBlockType.code:
            return convertCode(chunk.sections);
        case declare_2.SlateBlockType.blockquote:
            return convertBlockquote(chunk.sections);
        default:
            return null;
    }
}
function splitSections(sections) {
    const results = [];
    let chunk = null;
    for (const section of sections) {
        const sectionType = section.type;
        if (chunkTypes.includes(sectionType)) {
            if (!chunk || chunk.type !== sectionType) {
                chunk = {
                    type: sectionType,
                    sections: [section],
                };
                results.push(chunk);
            }
            else {
                // 如果没有 chunk 的话，一定会进入创建 chunk 的条件
                chunk.sections.push(section);
            }
        }
        else {
            chunk = null;
            results.push(section);
        }
    }
    return results;
}
function convertToSlateValue(title, sections) {
    const sectionNodes = convertSectionToNodes(sections);
    const document = {
        key: 'document',
        nodes: [
            convertTitle(title),
            ...sectionNodes,
        ],
    };
    return slate_1.Value.fromJSON({ document });
}
exports.convertToSlateValue = convertToSlateValue;
function convertSectionToNodes(sections) {
    const nodes = [];
    const chunks = splitSections(sections);
    for (const chunk of chunks) {
        if (chunk instanceof SectionModel_1.default) {
            nodes.push(convertSection(chunk));
        }
        else {
            const chunkNode = convertSectionChunk(chunk);
            chunkNode && nodes.push(chunkNode);
        }
    }
    return nodes;
}
exports.convertSectionToNodes = convertSectionToNodes;
