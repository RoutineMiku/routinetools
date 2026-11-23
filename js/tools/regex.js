/* 正则表达式测试器 */
registerTool({
  id: 'regex',
  name: '正则测试器',
  icon: '🧪',
  category: 'network',
  desc: '实时测试正则表达式，高亮匹配结果，支持常用修饰符与捕获组查看。',
  badge: 'NEW',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="field"><label>正则表达式</label>
        <div style="display:flex;gap:8px">
          <span style="padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:#f7f9fd;color:var(--ink-3)">/</span>
          <input type="text" id="rxPattern" class="tool-input" placeholder="例如：\d{3}-\d{4}" style="flex:1">
          <span style="padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:#f7f9fd;color:var(--ink-3)">/</span>
          <input type="text" id="rxFlags" class="tool-input" value="gi" style="width:80px" placeholder="修饰符">
        </div>
        <div class="tool-hint">常用修饰符：g 全局 · i 忽略大小写 · m 多行 · s 点匹配换行 · u Unicode</div>
      </div>
      <div class="field"><label>测试文本</label><textarea id="rxText" style="min-height:140px">联系邮箱：hello@routinemiku.com
电话：138-1234 备用：010-8888
网址：https://github.com/RoutineMiku/routinetools</textarea></div>
      <div class="tool-row">
        <div class="tool-col">
          <label class="tool-label">匹配结果</label>
          <div class="preview-box" id="rxResult" style="display:block;min-height:120px;white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace;font-size:13px"></div>
        </div>
        <div class="tool-col">
          <label class="tool-label">匹配详情</label>
          <div id="rxMatches" class="info-note" style="max-height:220px;overflow:auto">等待输入…</div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    function test() {
      const pat = $('rxPattern').value, flags = $('rxFlags').value, text = $('rxText').value;
      const out = $('rxResult'), detail = $('rxMatches');
      if (!pat) { out.textContent = ''; detail.textContent = '请输入正则表达式'; return; }
      let re;
      try { re = new RegExp(pat, flags); }
      catch (e) { detail.innerHTML = '<span style="color:#e33">表达式错误：' + e.message + '</span>'; return; }
      let count = 0, html = '', last = 0, marked = '';
      const limit = flags.includes('g') ? 10000 : 1;
      let m;
      while ((m = re.exec(text)) !== null && count < limit) {
        count++;
        marked += esc(text.slice(last, m.index)) + '<mark style="background:#ffe08a;border-radius:3px">' + esc(m[0]) + '</mark>';
        last = m.index + m[0].length;
        html += `<div style="padding:4px 0;border-bottom:1px solid var(--line)"><b>#${count}</b> "${esc(m[0])}" @ ${m.index}${m.length > 1 ? ' · 组：' + m.slice(1).map(function (g) { return g === undefined ? 'undefined' : '"' + esc(g) + '"'; }).join(', ') : ''}</div>`;
        if (!flags.includes('g')) break;
        if (m[0] === '') re.lastIndex++;
      }
      marked += esc(text.slice(last));
      out.innerHTML = marked || '<span class="preview-placeholder">无匹配</span>';
      detail.innerHTML = count ? '<div style="margin-bottom:6px">共 <b>' + count + '</b> 处匹配</div>' + html : '无匹配结果';
    }
    function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    ['rxPattern','rxFlags','rxText'].forEach(function (id) { $(id).addEventListener('input', test); });
    test();
  }
});
