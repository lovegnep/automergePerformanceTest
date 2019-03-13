"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const declare_1 = require("../declare");
const slate_1 = require("../convert/slate");
const SectionModel_1 = require("./SectionModel");
var SectionDiffType;
(function (SectionDiffType) {
    SectionDiffType["delete"] = "delete";
    SectionDiffType["replace"] = "replace";
    SectionDiffType["create"] = "create";
})(SectionDiffType = exports.SectionDiffType || (exports.SectionDiffType = {}));
function findSection(sections, id, key) {
    return _.find(sections, (section) => {
        const isIdEqual = !!id && !!section.id && section.id === id;
        const isKeyEqual = !!key && !!section.key && section.key === key;
        return isIdEqual || isKeyEqual;
    });
}
class SectionCollection {
    constructor(sections = []) {
        this.sections = [];
        this.sections = sections;
    }
    static fromServerData(sections) {
        const models = sections.map((section) => {
            let rawData = {};
            const content = section.content;
            if (!content) {
                throw new Error('No content in section');
            }
            if (content.raw) {
                try {
                    rawData = JSON.parse(content.raw);
                }
                catch (e) {
                    console.error(e); // tslint:disable
                }
            }
            return new SectionModel_1.default(Object.assign({}, rawData, { id: section._id, key: (section.local && section.local.key) || '', type: content.type }));
        });
        return new SectionCollection(models);
    }
    static fromSlateValue(value) {
        const sections = slate_1.convertToSections(value);
        return new SectionCollection(sections);
    }
    static fromContents(contents) {
        const models = contents.map((content) => {
            let rawData = {};
            if (!content) {
                throw new Error('Invalid ContentSchema');
            }
            if (content.raw) {
                try {
                    rawData = JSON.parse(content.raw);
                }
                catch (e) {
                    console.error(e); // tslint:disable
                }
            }
            return new SectionModel_1.default(Object.assign({}, rawData, { id: _.uniqueId('section_'), key: '', type: content.type }));
        });
        return new SectionCollection(models);
    }
    toSlateValue(title) {
        return slate_1.convertToSlateValue(title, this.sections);
    }
    isEqual(targetCollection) {
        return this.diff(targetCollection).length === 0;
    }
    diff(targetCollection) {
        const diffId = _.uniqueId('diff');
        const results = [];
        this.sections.forEach((section) => {
            const target = targetCollection.find(section.id, section.key);
            if (!target) {
                results.push({
                    diffId,
                    type: SectionDiffType.delete,
                    section: section,
                });
            }
        });
        targetCollection.sections.forEach((target, index, arr) => {
            const current = this.find(target.id, target.key);
            const nextIds = arr.slice(index + 1).map((item) => String(item.id || item.key));
            if (!current) {
                results.push({
                    diffId,
                    nextIds,
                    type: SectionDiffType.create,
                    section: target,
                });
            }
            else if (!target.isEqual(current)) {
                results.push({
                    diffId,
                    nextIds,
                    type: SectionDiffType.replace,
                    section: current.merge(target),
                    origin: current,
                });
            }
        });
        return results;
    }
    find(id, key) {
        return findSection(this.sections, id, key);
    }
    mergeDiffs(diffs) {
        const sections = this.sections.slice(0);
        let currentDiffId = null;
        let createStack = [];
        for (const diff of diffs) {
            if (diff.diffId && diff.type === SectionDiffType.create) {
                // 把同一个批次的创建放到一起，然后从后往前创建，防止单个合并的时候导致的顺序异常
                if (currentDiffId !== diff.diffId) {
                    createStack.reverse().forEach((temp) => this.mergeDiff(sections, temp));
                    currentDiffId = diff.diffId;
                    createStack = [diff];
                }
                else {
                    createStack.push(diff);
                }
            }
            else {
                createStack.reverse().forEach((temp) => this.mergeDiff(sections, temp));
                this.mergeDiff(sections, diff);
                currentDiffId = null;
                createStack = [];
            }
        }
        // 防止最后一个是带有 id 的创建 diff
        createStack.reverse().forEach((temp) => this.mergeDiff(sections, temp));
        return new SectionCollection(sections);
    }
    combineDiffs(diffs) {
        const targetCollection = this.mergeDiffs(diffs);
        return this.diff(targetCollection);
    }
    isEmpty() {
        if (this.sections.length === 0) {
            return true;
        }
        if (this.sections.length !== 1) {
            return false;
        }
        const firstSection = this.sections[0];
        if (firstSection.type !== declare_1.EditorBlockType.paragraph) {
            return false;
        }
        return firstSection.text.length === 0;
    }
    mergeDiff(sections, diff) {
        switch (diff.type) {
            case SectionDiffType.create:
                this.mergeCreateDiff(sections, diff);
                break;
            case SectionDiffType.delete:
                this.mergeDeleteDiff(sections, diff);
                break;
            case SectionDiffType.replace:
                this.mergeReplaceDiff(sections, diff);
                break;
            default:
        }
    }
    mergeReplaceDiff(sections, diff) {
        const replaceModel = diff.section;
        const current = findSection(sections, replaceModel.id, replaceModel.key);
        if (current) {
            // 找到被替换的目标了，直接换掉数据引用
            const index = sections.indexOf(current);
            sections[index] = current.merge(replaceModel);
        }
        else {
            // 没有找到替换的目标，那就啥也不做
        }
    }
    mergeDeleteDiff(sections, diff) {
        const deleteModel = diff.section;
        const current = findSection(sections, deleteModel.id, deleteModel.key);
        if (current) {
            _.pull(sections, current);
        }
    }
    mergeCreateDiff(sections, diff) {
        const sectionIds = diff.nextIds;
        const newSection = diff.section;
        const current = findSection(sections, newSection.id, newSection.key);
        if (current) {
            // 如果当前 section 存在的话，把他移除，防止在操作重放的时候排序不对
            _.pull(sections, current);
        }
        let nextModel = null;
        if (sectionIds) {
            sectionIds.some((id) => {
                nextModel = findSection(sections, id, id) || null;
                return !!nextModel;
            });
        }
        if (nextModel) {
            const index = sections.indexOf(nextModel);
            sections.splice(index, 0, newSection);
        }
        else {
            sections.push(newSection);
        }
    }
}
exports.default = SectionCollection;
