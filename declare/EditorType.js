"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Slate_1 = require("./Slate");
var EditorBlockDataType;
(function (EditorBlockDataType) {
    EditorBlockDataType["alignLeft"] = "align-left";
    EditorBlockDataType["alignCenter"] = "align-center";
    EditorBlockDataType["alignRight"] = "align-right";
})(EditorBlockDataType = exports.EditorBlockDataType || (exports.EditorBlockDataType = {}));
var EditorInlineType;
(function (EditorInlineType) {
    EditorInlineType["link"] = "LINK";
    EditorInlineType["date"] = "DATE";
    EditorInlineType["mention"] = "MENTION";
    EditorInlineType["discussion"] = "DISCUSSION";
    EditorInlineType["relation"] = "RELATION";
})(EditorInlineType = exports.EditorInlineType || (exports.EditorInlineType = {}));
// color 色值约定都为大写字母
var EditorColorType;
(function (EditorColorType) {
    EditorColorType["black"] = "#383838";
    EditorColorType["darkGray"] = "#808080";
    EditorColorType["lightGray"] = "#A6A6A6";
    EditorColorType["red"] = "#FF4F3E";
    EditorColorType["orange"] = "#FFAF38";
    EditorColorType["yellow"] = "#EDCF3C";
    EditorColorType["green"] = "#2FBDB3";
    EditorColorType["blue"] = "#3DA8F5";
    EditorColorType["purple"] = "#797EC9";
})(EditorColorType = exports.EditorColorType || (exports.EditorColorType = {}));
var EditorMarkType;
(function (EditorMarkType) {
    EditorMarkType["bold"] = "BOLD";
    EditorMarkType["italic"] = "ITALIC";
    EditorMarkType["underline"] = "UNDERLINE";
    EditorMarkType["strikethrough"] = "STRIKETHROUGH";
    EditorMarkType["color"] = "COLOR";
    EditorMarkType["placeholder"] = "PLACEHOLDER";
    EditorMarkType["inlineCode"] = "CODE";
})(EditorMarkType = exports.EditorMarkType || (exports.EditorMarkType = {}));
var EditorDecorationType;
(function (EditorDecorationType) {
    EditorDecorationType["pasteLinkify"] = "paste-linkify";
    EditorDecorationType["createDiscussion"] = "create-discussion";
    EditorDecorationType["quickInsert"] = "quick-insert";
})(EditorDecorationType = exports.EditorDecorationType || (exports.EditorDecorationType = {}));
var EditorEditType;
(function (EditorEditType) {
    EditorEditType["delete"] = "delete";
    EditorEditType["copy"] = "copy";
    EditorEditType["cut"] = "cut";
    EditorEditType["insertBefore"] = "insertBefore";
    EditorEditType["insertAfter"] = "insertAfter";
    EditorEditType["download"] = "download";
    EditorEditType["replace"] = "replace";
    EditorEditType["toggleSummary"] = "toggleSummary";
    EditorEditType["goto"] = "goto";
})(EditorEditType = exports.EditorEditType || (exports.EditorEditType = {}));
exports.EditorBlockType = Object.assign({}, Slate_1.SlateBlockType);
exports.EditorType = Object.assign({}, EditorBlockDataType, Slate_1.SlateBlockType, EditorInlineType, EditorMarkType, EditorColorType);
