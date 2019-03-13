"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SlateObject;
(function (SlateObject) {
    SlateObject["value"] = "value";
    SlateObject["document"] = "document";
    SlateObject["block"] = "block";
    SlateObject["inline"] = "inline";
    SlateObject["text"] = "text";
    SlateObject["leaf"] = "leaf";
    SlateObject["mark"] = "mark";
    SlateObject["character"] = "character";
    SlateObject["change"] = "change";
    SlateObject["range"] = "range";
})(SlateObject = exports.SlateObject || (exports.SlateObject = {}));
var SlatePlainBlockType;
(function (SlatePlainBlockType) {
    SlatePlainBlockType["paragraph"] = "paragraph";
    SlatePlainBlockType["headerOne"] = "header-one";
    SlatePlainBlockType["headerTwo"] = "header-two";
    SlatePlainBlockType["headerThree"] = "header-three";
    SlatePlainBlockType["checkbox"] = "checkbox";
    SlatePlainBlockType["hr"] = "hr";
    SlatePlainBlockType["image"] = "image";
    SlatePlainBlockType["attachment"] = "attachment";
    SlatePlainBlockType["relation"] = "relation";
    SlatePlainBlockType["embed"] = "embed";
    SlatePlainBlockType["atomic"] = "atomic";
})(SlatePlainBlockType = exports.SlatePlainBlockType || (exports.SlatePlainBlockType = {}));
var SlateParentBlockType;
(function (SlateParentBlockType) {
    SlateParentBlockType["codeWrapper"] = "code-wrapper";
    SlateParentBlockType["orderedListWrapper"] = "ordered-list-wrapper";
    SlateParentBlockType["unorderedListWrapper"] = "unordered-list-wrapper";
    SlateParentBlockType["blockquoteWrapper"] = "blockquote-wrapper";
    SlateParentBlockType["table"] = "table";
})(SlateParentBlockType = exports.SlateParentBlockType || (exports.SlateParentBlockType = {}));
var SlateChildBlockType;
(function (SlateChildBlockType) {
    SlateChildBlockType["blockquote"] = "blockquote";
    SlateChildBlockType["code"] = "code-block";
    SlateChildBlockType["orderedListItem"] = "ordered-list-item";
    SlateChildBlockType["unorderedListItem"] = "unordered-list-item";
    SlateChildBlockType["tableRow"] = "table-row";
    SlateChildBlockType["tableCell"] = "table-cell";
})(SlateChildBlockType = exports.SlateChildBlockType || (exports.SlateChildBlockType = {}));
var SlateHelpBlockType;
(function (SlateHelpBlockType) {
    SlateHelpBlockType["title"] = "title";
})(SlateHelpBlockType = exports.SlateHelpBlockType || (exports.SlateHelpBlockType = {}));
exports.SlateBlockType = Object.assign({}, SlatePlainBlockType, SlateParentBlockType, SlateChildBlockType, SlateHelpBlockType);
