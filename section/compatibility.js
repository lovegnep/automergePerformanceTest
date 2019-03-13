"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const declare_1 = require("../declare");
const declare_2 = require("../declare");
const declare_3 = require("../declare");
/**
 * 兼容旧的 unstyled 数据
 * ```
 * 原来 paragraph 类型存储的是字符串 unstyled
 *
 * ```
 */
function fixUnstyledData(target) {
    if (target.type === declare_1.DraftBlockType.unstyled) {
        target.type = declare_1.EditorType.paragraph;
    }
}
/**
 * 兼容旧的 atomic 数据
 * ```
 * 原来存在 atomic 类型的数据如附件、分割线，真正的 type 存放在 data 上
 *
 * ```
 */
function fixAtomicData(target) {
    if (target.type === declare_1.DraftBlockType.atomic) {
        target.type = target.data.type || declare_1.EditorType.paragraph;
        delete target.data.type;
    }
}
/**
 * 兼容旧的 depth 数据
 * ```
 * 原来 depth 是和 data 同层级的数据，将其移入到 data 里面
 *
 * ```
 */
function fixDepthData(target) {
    if (target.depth) {
        target.data.depth = target.depth;
        delete target.depth;
    }
}
/**
 * 兼容旧的表格数据
 * 1.
 * ```
 * interface DeprecatedTableData {
 *   type: EditorBlockType.table
 *   contents: string[][]
 *   eachColWidth: number[]
 * }
 * ```
 * 2.
 * ```
 * interface DeprecatedTableData {
 *   type: EditorBlockType.table
 *   meta: CellMeta[][]
 *   eachColWidth: number[]
 * }
 * ```
 */
function fixTableData(target) {
    if (target.type === declare_1.EditorType.table && target.data.contents) {
        const contents = target.data.contents;
        const meta = contents.map((rowContents) => {
            return rowContents.map((content) => ({ content }));
        });
        delete target.data.contents;
        target.data.meta = meta;
    }
    if (target.type === declare_1.EditorType.table && target.data.meta) {
        target.nodes = target.data.meta.map((row) => {
            const rowNodes = row.map((cell) => {
                const { content, placeholder } = cell;
                const text = content || '';
                const styles = [{
                        length: text.length,
                        offset: 0,
                        style: `${declare_3.EditorMarkType.color}_${declare_3.EditorColorType.lightGray}`,
                    }];
                return {
                    type: declare_1.SlateBlockType.tableCell,
                    nodes: [{
                            text,
                            inlineStyleRanges: placeholder ? styles : [],
                        }],
                };
            });
            return {
                type: declare_1.SlateBlockType.tableRow,
                nodes: rowNodes,
            };
        });
        delete target.data.meta;
    }
}
/**
 * 修正旧的图片数据
 */
function fixImageData(target) {
    const data = target.data;
    if (target.type === declare_1.EditorType.image &&
        data.url &&
        !data.downloadUrl) {
        data.downloadUrl = data.url;
        delete data.url;
    }
}
/**
 * 修正align数据
 */
function fixAlignData(target) {
    const align = target.data.align;
    const alignTypes = Array.from(Object.values(declare_2.EditorBlockDataType));
    if (align && !alignTypes.includes(align)) {
        delete target.data.align;
    }
}
/**
 * 修正 entity 的数据
 * 在早期的设计里面，希望每个 block 保存自己单独的 entityRanges 和 entityMap
 * 但是这样的设计会导致每次进行 entity 移除或者新增的时候，会整体影响后面的所有 entity
 * 具体的表现是，在一个有很多 entity 的文档中，删除第一个含有 entity 的段落，会触发大量的 replace API
 */
function fixEntities(target) {
    if (target.entityRanges && target.entityMap && target.entities.length < target.entityRanges.length) {
        const entities = [];
        for (const entityRange of target.entityRanges) {
            const entityData = target.entityMap[entityRange.key];
            if (entityData) {
                entities.push(Object.assign({}, entityData, _.pick(entityRange, 'length', 'offset')));
            }
        }
        target.entities = entities;
    }
}
function fixAll(target) {
    fixUnstyledData(target);
    fixAtomicData(target);
    fixDepthData(target);
    fixImageData(target);
    fixTableData(target);
    fixAlignData(target);
    fixEntities(target);
}
exports.fixAll = fixAll;
