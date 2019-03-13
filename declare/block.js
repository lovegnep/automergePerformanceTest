"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
function isAttachmentBlock(block) {
    if (!block) {
        return false;
    }
    const type = block.type;
    return type === _1.EditorBlockType.attachment;
}
exports.isAttachmentBlock = isAttachmentBlock;
function isImageBlock(block) {
    if (!block) {
        return false;
    }
    const type = block.type;
    return type === _1.EditorBlockType.image;
}
exports.isImageBlock = isImageBlock;
function isRelationBlock(block) {
    if (!block) {
        return false;
    }
    const type = block.type;
    return type === _1.EditorBlockType.relation;
}
exports.isRelationBlock = isRelationBlock;
function isEmbedBlock(block) {
    if (!block) {
        return false;
    }
    const type = block.type;
    return type === _1.EditorBlockType.embed;
}
exports.isEmbedBlock = isEmbedBlock;
function isTableBlock(block) {
    if (!block) {
        return false;
    }
    const type = block.type;
    return type === _1.EditorBlockType.table;
}
exports.isTableBlock = isTableBlock;
const headerBlockTypes = [
    _1.EditorBlockType.headerOne,
    _1.EditorBlockType.headerTwo,
    _1.EditorBlockType.headerThree,
];
exports.textBlockTypes = [
    _1.EditorBlockType.headerOne,
    _1.EditorBlockType.headerTwo,
    _1.EditorBlockType.headerThree,
    _1.EditorBlockType.blockquote,
    _1.EditorBlockType.blockquoteWrapper,
    _1.EditorBlockType.orderedListItem,
    _1.EditorBlockType.orderedListWrapper,
    _1.EditorBlockType.unorderedListItem,
    _1.EditorBlockType.unorderedListWrapper,
    _1.EditorBlockType.checkbox,
    _1.EditorBlockType.code,
    _1.EditorBlockType.codeWrapper,
    _1.EditorBlockType.paragraph,
];
const listBlockTypes = [
    _1.EditorBlockType.orderedListItem,
    _1.EditorBlockType.orderedListWrapper,
    _1.EditorBlockType.unorderedListItem,
    _1.EditorBlockType.unorderedListWrapper,
];
const wrapperBlockTypes = [
    _1.EditorBlockType.codeWrapper,
    _1.EditorBlockType.orderedListWrapper,
    _1.EditorBlockType.unorderedListWrapper,
    _1.EditorBlockType.blockquoteWrapper,
];
const itemParentMap = new Map([
    [_1.EditorBlockType.orderedListItem, _1.EditorBlockType.orderedListWrapper],
    [_1.EditorBlockType.unorderedListItem, _1.EditorBlockType.unorderedListWrapper],
    [_1.EditorBlockType.blockquote, _1.EditorBlockType.blockquoteWrapper],
    [_1.EditorBlockType.code, _1.EditorBlockType.codeWrapper],
]);
const itemChildMap = new Map([
    [_1.EditorBlockType.orderedListWrapper, _1.EditorBlockType.orderedListItem],
    [_1.EditorBlockType.unorderedListWrapper, _1.EditorBlockType.unorderedListItem],
    [_1.EditorBlockType.blockquoteWrapper, _1.EditorBlockType.blockquote],
    [_1.EditorBlockType.codeWrapper, _1.EditorBlockType.code],
    [_1.EditorBlockType.tableCell, _1.EditorBlockType.paragraph],
    [_1.EditorBlockType.tableRow, _1.EditorBlockType.tableCell],
]);
function isTitleBlock(type) {
    return type === _1.EditorBlockType.title;
}
exports.isTitleBlock = isTitleBlock;
function isHeaderBlock(type) {
    return headerBlockTypes.includes(type);
}
exports.isHeaderBlock = isHeaderBlock;
function isVoidBlock(type) {
    return !isTextBlock(type) && !isTitleBlock(type);
}
exports.isVoidBlock = isVoidBlock;
function isTextBlock(type) {
    return exports.textBlockTypes.includes(type);
}
exports.isTextBlock = isTextBlock;
function isListBlock(type) {
    return listBlockTypes.includes(type);
}
exports.isListBlock = isListBlock;
function isChildBlock(type) {
    const childTypes = Array.from(Object.values(_1.SlateChildBlockType));
    return childTypes.includes(type);
}
exports.isChildBlock = isChildBlock;
function isWrapperBlock(type) {
    return wrapperBlockTypes.includes(type);
}
exports.isWrapperBlock = isWrapperBlock;
function isParentBlock(type) {
    const parentTypes = Array.from(Object.values(_1.SlateParentBlockType));
    return parentTypes.includes(type);
}
exports.isParentBlock = isParentBlock;
function isHelpBlock(type) {
    const helpTypes = Array.from(Object.values(_1.SlateHelpBlockType));
    return helpTypes.includes(type);
}
exports.isHelpBlock = isHelpBlock;
function isInline(type) {
    const inlineNormalTypes = Array.from(Object.values(_1.EditorInlineType));
    const inlineRelationTypes = Array.from(Object.values(_1.InlineRelationType));
    const inlineTypes = inlineNormalTypes.concat(inlineRelationTypes);
    return inlineTypes.includes(type);
}
exports.isInline = isInline;
function getParentType(type) {
    return itemParentMap.get(type);
}
exports.getParentType = getParentType;
function getChildType(type) {
    return itemChildMap.get(type);
}
exports.getChildType = getChildType;
// TODO: 这里先暂时这样写一下
function getBottomType(type) {
    if (type === _1.SlateBlockType.table) {
        return _1.SlateBlockType.tableCell;
    }
    return type;
}
exports.getBottomType = getBottomType;
