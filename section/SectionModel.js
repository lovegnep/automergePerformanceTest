"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const declare_1 = require("../declare");
const values_1 = require("./values");
const compatibility_1 = require("./compatibility");
/**
 * Section 的本地数据模型，和 Draft 中的 block 数据对应。
 * 这个数据有三种形态：
 * 1. 不是本地保存的远程数据
 * 2. 未保存的本地数据
 * 3. 从本地保存到远程的数据
 *
 * 之所以分这三个形态的原因是，本地数据需要索引（block 中的 key 值），
 * 而保存到远程之后，要让用户能够继续在当前的状态下编辑，就需要保持 key 值不变。
 *
 * 所以，在这个数据模型里面，id 或者 key 一样都是代表同一个区块内容。
 */
class SectionModel {
    constructor(data) {
        this.id = '';
        this.key = '';
        this.type = declare_1.EditorType.paragraph;
        this.data = {};
        this.nodes = [];
        this.text = '';
        this.entities = [];
        this.inlineStyleRanges = [];
        this.remoteSection = null;
        Object.assign(this, data);
        if (!this.key) {
            this.key = this.id || _.uniqueId('section_');
        }
        compatibility_1.fixAll(this);
    }
    merge(target) {
        const data = Object.assign({}, target.toRemoteData(), { key: this.key, id: this.id || target.id });
        return new SectionModel(data);
    }
    clone() {
        return new SectionModel({
            id: this.id,
            key: this.key,
            text: this.text,
            type: this.type,
            data: _.cloneDeep(this.data),
            nodes: _.cloneDeep(this.nodes),
            entities: _.cloneDeep(this.entities),
            inlineStyleRanges: _.cloneDeep(this.inlineStyleRanges),
            remoteSection: this.remoteSection,
        });
    }
    isEqual(target) {
        if (this.type !== target.type) {
            return false;
        }
        const currentData = this.toRemoteData();
        const targetData = target.toRemoteData();
        const isContentEqual = _.isEqual(_.omit(currentData, 'inlineStyleRanges', 'entities'), _.omit(targetData, 'inlineStyleRanges', 'entities'));
        const isInlineStylesEqual = !_.xorWith(currentData.inlineStyleRanges, targetData.inlineStyleRanges, _.isEqual).length;
        const isEntitiesEqual = !_.xorWith(currentData.entities, targetData.entities, _.isEqual).length;
        return isContentEqual && isInlineStylesEqual && isEntitiesEqual;
    }
    toRemoteData() {
        return _.pick(this.clone(), 'type', 'data', 'nodes', 'inlineStyleRanges', 'text', 'entities');
    }
    toRequestData() {
        const rawData = this.toRemoteData();
        const type = rawData.type;
        delete rawData.type;
        if (rawData.data) {
            // 不知道为什么复制的时候 data 中会带有 className 数据，抹掉
            delete rawData.data.className;
        }
        const plainData = values_1.omitEmpty(rawData);
        return {
            key: this.key,
            raw: _.isEmpty(plainData) ? '' : JSON.stringify(plainData),
            type,
        };
    }
}
exports.default = SectionModel;
