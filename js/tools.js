/* ============================================================
 * 工具注册表
 * ------------------------------------------------------------
 * 【如何新增一个工具？】
 * 1. 在 js/tools/ 目录下新建一个 js 文件，例如 my-tool.js
 * 2. 在文件里调用 registerTool({ ... }) 注册工具信息（见下方注释示例）
 * 3. 把文件名加入下方 TOOL_SCRIPTS 数组
 * 4. 刷新网页即可，无需改动其他任何代码
 *
 * registerTool 参数示例：
 * registerTool({
 *   id: 'my-tool',            // 唯一英文标识
 *   name: '我的工具',          // 卡片标题
 *   icon: '🛠️',               // 图标 emoji
 *   category: 'image',        // 所属分类 id（见 TOOL_CATEGORIES）
 *   desc: '一句话描述这个工具',
 *   badge: 'NEW',             // 可选，卡片角标
 *   run: function(container) { // container 是工具弹窗的内容容器
 *     container.innerHTML = '<p>你好</p>';
 *   }
 * });
 * ============================================================ */

// 工具分类（顺序即页面展示顺序）
window.TOOL_CATEGORIES = [
  { id: 'image',    name: '图片处理', icon: '🖼️', desc: '压缩 / 证件照 / 格式转换 / 裁剪 / 水印' },
  { id: 'document', name: '文档处理', icon: '📄', desc: 'PDF 合并拆分 / JSON / 文本处理' },
  { id: 'network',  name: '网络工具', icon: '🌐', desc: '编码解码 / 哈希 / WebADB / SSH' },
  { id: 'more',     name: '更多工具', icon: '🧰', desc: '持续扩充中，欢迎提交你的工具' }
];

// 需要加载的工具脚本（新增工具时在这里加一行）
window.TOOL_SCRIPTS = [
  'js/tools/common.js',
  'js/tools/image-compress.js',
  'js/tools/id-photo.js',
  'js/tools/image-convert.js',
  'js/tools/image-crop.js',
  'js/tools/image-watermark.js',
  'js/tools/json-to-file.js',
  'js/tools/pdf-merge.js',
  'js/tools/pdf-split.js',
  'js/tools/pdf-rotate.js',
  'js/tools/images-to-pdf.js',
  'js/tools/base64.js',
  'js/tools/url-encode.js',
  'js/tools/hash.js',
  'js/tools/webadb.js',
  'js/tools/ssh.js',
  // 第二批新增工具
  'js/tools/qrcode.js',
  'js/tools/qr-decode.js',
  'js/tools/text-tools.js',
  'js/tools/markdown-preview.js',
  'js/tools/pdf-watermark.js',
  'js/tools/regex.js',
  'js/tools/password.js',
  'js/tools/timestamp.js',
  'js/tools/unit-converter.js',
  'js/tools/color-tools.js',
  'js/tools/image-rotate.js',
  'js/tools/image-base64.js'
];

// 全局注册表
window.TOOL_REGISTRY = [];
window.registerTool = function (tool) {
  if (!tool || !tool.id) { console.warn('registerTool: 缺少 id', tool); return; }
  window.TOOL_REGISTRY.push(tool);
};
