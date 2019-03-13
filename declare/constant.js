"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ONE_SECOND = 1000;
const ONE_MB = 1024 * 1024;
const ONE_GB = 1024 * ONE_MB;
exports.TITLE_MAX_LENGTH = 100;
exports.SUMMARY_MAX_LENGTH = 1000;
// 编辑器自动保存的时间周期
exports.EDITOR_SAVE_CYCLE = 5 * ONE_SECOND;
// 历史记录自动保存的时间周期
exports.VERSION_SAVE_CYCLE = 5 * 60 * ONE_SECOND;
exports.INDENT_MAX_DEPTH = 5;
exports.archiveThresholdTime = 30 * 24 * 3600 * 1000;
// 表格相关
exports.MIN_TABLE_COLUMN_WIDTH = 60;
exports.MAX_TABLE_COLUMN = 15;
// 图片最大大小是 20M
exports.MAX_IMAGE_SIZE = 20 * ONE_MB;
// Word 和 PPT 最大大小是 10M
exports.MAX_PPT_AND_DOC_SIZE = 10 * ONE_MB;
// Excel 最大大小是 5M
exports.MAX_EXCEL_SIZE = 5 * ONE_MB;
// TXT 最大大小是 2M
exports.MAX_TXT_SIZE = 2 * ONE_MB;
// PDF 最大大小是 100M
exports.MAX_PDF_SIZE = 100 * ONE_MB;
// 图片最大的分辨率是 10000 x 10000
exports.MAX_IMAGE_WIDTH = 10000;
exports.MAX_IMAGE_HEIGHT = 10000;
// 上传文件的时候，一次允许选择的最大文件数量
exports.MAX_ONCE_FILE_COUNT = 50;
// 附件的最大文件大小是 1G
exports.MAX_ATTACHMENT_SIZE = ONE_GB;
// 超过这个大小的文件应该使用分片上传
exports.CHUNK_UPLOAD_SIZE = exports.MAX_IMAGE_SIZE;
// 并行上传文件的数量
exports.MULTIPLE_UPLOAD_COUNT = 1;
// 搜索最大长度
exports.SEARCH_MAX_LENGTH = 100;
// 搜索的自动执行节流时间为 300ms
exports.SEARCH_THROTTLE_TIME = 300;
// 一次能同时存储的数量上限
exports.MAX_MULTI_SAVE_COUNT = 10;
// 左侧文档树的宽度调整边界
exports.LEFT_SLIDE_MIN_WIDTH = 272;
exports.LEFT_SLIDE_MAX_WIDTH = 325;
// 图片伸缩的单位值、边界值
exports.RATIO_SCALE = 10;
exports.RATIO_MIN = 10;
exports.RATIO_MAX = 490;
// 默认的文档名字
exports.DefaultDocumentTitle = '';
// 默认的文件夹名字
exports.DefaultFolderTitle = '';
// 最大的文件名的长度
exports.MAX_FILE_NAME_LENGTH = 100;
// 文件夹下允许上传的最大是 100M
exports.FOLDER_FILE_MAX_SIZE = 100 * ONE_MB;
// 一天的总毫秒数
exports.MS_OF_A_DAY = 24 * 3600 * 1000;
// 不合法的搜索字符
exports.INVALID_QUERY_CHARS = '!@#$%^&*();:\'",.><|\\/{}[]-=_+~`?';
// 唤起快速插入的快捷键
exports.QUICK_INSERT_KEY = '+';
// 知识库空间名称
exports.WORKSPACE_NAME_MAX_LENGTH = 100;
// 知识库空间简介
exports.WORKSPACE_DESCRIPTION_MAX_LENGTH = 1000;
// 导入Markdown
exports.IMPORT_MARKDOWN_MAX_SIZE = ONE_MB;
// 网络断开连接
exports.INTERNET_DISCONNECTED_MESSAGE = 'ajax error 0';
// 折叠目录的最小宽度
exports.COLLAPSE_MIN_WIDTH = 240;
// modal 的 zindex 应该小于 dropdown
exports.MODAL_Z_INDEX = 900;
exports.DROPDOWN_Z_INDEX = 1000;
// 二次确认框的曾经应该是最高的
exports.CONFIRM_Z_INDEX = 1100;
exports.DATE_PICKER_PLACEHOLDER = '请选择日期';
exports.DEFAULT_EMBED_GHOST_SIZE = {
    width: 660,
    height: 600,
};
exports.REQUEST_TIME_OUT = 10 * 1000;
// 应用移动端样式的最大屏幕宽度
exports.MOBILE_WIDTH = 576;
// 提醒他人查看的消息最大长度
exports.MAX_NOTIFY_MESSAGE_LENGTH = 80;
// slate 的标题的 key
exports.TITLE_KEY = 'slate-title';
