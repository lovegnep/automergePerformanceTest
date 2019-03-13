"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 对应 EditorType 中 relation 类型的 type 和 data
var RelationType;
(function (RelationType) {
    RelationType["document"] = "document";
    RelationType["folder"] = "folder";
    RelationType["teambitionTask"] = "teambition-task";
})(RelationType = exports.RelationType || (exports.RelationType = {}));
var RelatedNodeType;
(function (RelatedNodeType) {
    RelatedNodeType["thoughtsNode"] = "thoughts-node";
    RelatedNodeType["teambitionTask"] = "teambition-task";
    RelatedNodeType["error"] = "error";
})(RelatedNodeType = exports.RelatedNodeType || (exports.RelatedNodeType = {}));
var EmbedType;
(function (EmbedType) {
    EmbedType["gist"] = "gist";
    EmbedType["framer"] = "framer";
    EmbedType["bookmark"] = "bookmark";
})(EmbedType = exports.EmbedType || (exports.EmbedType = {}));
