"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SectionCollection_1 = require("./section/SectionCollection");
const Automerge = require("automerge");
const automerge_1 = require("./convert/automerge");
const Uuid = require("uuid/v1");
let textNumPerSection = 10000;
let sectionNum = 1;
const _documentId = '5c4ea9ea6d6db60001459794';
const _ownerId = '5c0a363cd65eda00012d1e83';
const created = new Date();
const updated = new Date();
const isDeleted = false;
const type = 'paragraph';
const hmac = '';
function showCurMemoryUsage() {
    // global.gc()
    const mem = process.memoryUsage();
    const keys = Object.keys(mem);
    for (const key of keys) {
        mem[key] = (mem[key] / 1024 / 1024).toFixed(2) + 'Mb';
    }
    console.debug(`当前内存使用情况：${JSON.stringify(mem)}`);
}
function random() {
    return Math.round(Math.random() * 100000);
}
function produceText() {
    const len = textNumPerSection;
    const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    const maxPos = $chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}
function produceSections() {
    const sections = [];
    for (let i = 0; i < sectionNum; i++) {
        const _contentId = Uuid();
        const section = {
            _id: Uuid(),
            created,
            updated,
            _ownerId,
            _documentId,
            isDeleted,
            pos: random(),
            __v: 4,
            _contentId,
            content: {
                _id: _contentId,
                created,
                updated,
                raw: `{\"text\":\"${produceText()}\"}`,
                type,
                hmac,
                _ownerId,
            },
        };
        sections.push(section);
    }
    return sections;
}
function produceDocument() {
    return {
        sections: produceSections(),
        title: '未命名文档',
    };
}
function getSlateValue() {
    const begin = Date.now();
    const document = produceDocument();
    const oldCollection = SectionCollection_1.default.fromServerData(document.sections);
    const slateValue = oldCollection.toSlateValue(document.title);
    console.debug(`初始化slate用时${Date.now() - begin}`);
    console.debug(`slate序列化后大小${Math.round(JSON.stringify(slateValue.toJS()).length / 1024)}Kb`);
    showCurMemoryUsage();
    return slateValue;
}
function initAutomergeDoc() {
    const slateValue = getSlateValue();
    const begin = Date.now();
    let automergeDoc = Automerge.init();
    showCurMemoryUsage();
    automergeDoc = Automerge.change(automergeDoc, 'initial doc', (tmpdoc) => {
        tmpdoc.value = automerge_1.slateToAutomergeValue(slateValue);
    });
    console.debug(`初始化automerge用时${Date.now() - begin}`);
    showCurMemoryUsage();
    console.debug(`automerge序列化后大小${Math.round(Automerge.save(automergeDoc).length / 1024)}Kb`);
}
function test() {
    const textNumArr = [1, 10, 100, 1000, 10000];
    const sectionNumArr = [1, 10, 100, 1000];
    for (const m of sectionNumArr) {
        for (const n of textNumArr) {
            console.debug(`section数量${m}, text数量${n}`);
            textNumPerSection = n;
            sectionNum = m;
            initAutomergeDoc();
            console.debug('=================================');
        }
    }
}
test();
