/* Markdown 预览与导出 */
registerTool({
  id: 'markdown-preview',
  name: 'Markdown 预览',
  icon: '📝',
  category: 'document',
  desc: '左侧写 Markdown，右侧实时预览排版效果，可导出为 HTML 文件。',
  badge: 'NEW',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col">
          <label class="tool-label">Markdown 源码</label>
          <textarea id="mdSrc" style="min-height:420px" placeholder="# 标题&#10;&#10;支持 **粗体**、*斜体*、列表、代码块、表格等"># 日常工具箱

**Powered by RoutineMiku**

## 支持语法
- 粗体、斜体、行内代码
- 有序与无序列表
- 链接与引用
- 代码块

[项目地址](https://github.com/RoutineMiku/routinetools)</textarea>
        </div>
        <div class="tool-col">
          <label class="tool-label">实时预览</label>
          <div id="mdView" class="app-desc" style="min-height:420px;border:1px solid var(--line);border-radius:12px;padding:16px;overflow:auto;background:#fff"></div>
        </div>
      </div>
      <div class="btn-group">
        <button class="btn-sm" id="mdExport">⬇️ 导出 HTML</button>
        <button class="btn-sm secondary" id="mdDownload">下载 .md</button>
        <button class="btn-sm secondary" id="mdCopyHtml">复制 HTML</button>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    let html = '';
    function render() {
      if (!window.marked) {
        $('mdView').innerHTML = '<div class="tool-hint">Markdown 组件加载中…</div>';
        return;
      }
      html = window.marked.parse($('mdSrc').value);
      $('mdView').innerHTML = '<div style="line-height:1.8">' + html + '</div>';
    }
    $('mdSrc').addEventListener('input', render);
    U.loadScript('https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js')
      .then(function () { if (window.marked) window.marked.setOptions({ gfm: true, breaks: true }); render(); })
      .catch(function () { $('mdView').innerHTML = '<div style="color:#e33">组件加载失败，请检查网络</div>'; });
    function fullHtml() {
      return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>Markdown 导出</title>' +
        '<style>body{max-width:800px;margin:40px auto;padding:0 20px;font-family:-apple-system,"Microsoft YaHei",sans-serif;line-height:1.8;color:#1f2740}' +
        'pre{background:#f1f3f9;padding:14px;border-radius:8px;overflow:auto}code{background:#f1f3f9;padding:2px 6px;border-radius:4px}' +
        'img{max-width:100%}blockquote{border-left:4px solid #4f6ef7;margin:0;padding-left:14px;color:#5a6480}</style></head><body>' + html + '</body></html>';
    }
    $('mdExport').addEventListener('click', function () {
      U.downloadBlob(new Blob([fullHtml()], { type: 'text/html;charset=utf-8' }), 'document-' + Date.now() + '.html');
      U.toast('已导出 HTML');
    });
    $('mdDownload').addEventListener('click', function () {
      U.downloadBlob(new Blob([$('mdSrc').value], { type: 'text/markdown;charset=utf-8' }), 'document-' + Date.now() + '.md');
    });
    $('mdCopyHtml').addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(html).then(function () { U.toast('已复制 HTML'); });
    });
  }
});
