/* 文本处理工具箱 */
registerTool({
  id: 'text-tools',
  name: '文本处理',
  icon: '📝',
  category: 'document',
  desc: '字数统计、大小写转换、去重、去空行、中英文标点转换等常用文本操作。',
  badge: 'NEW',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col">
          <div class="field"><label>文本内容</label><textarea id="ttText" style="min-height:300px" placeholder="在这里输入或粘贴文本…"></textarea></div>
        </div>
        <div class="tool-col narrow">
          <label class="tool-label">文本统计</label>
          <div class="info-note" id="ttStats" style="line-height:2">字符数：0<br>中文字数：0<br>单词数：0<br>行数：0<br>字节数：0</div>
          <label class="tool-label" style="margin-top:18px">快捷操作</label>
          <div class="pill-group" id="ttOps">
            <button class="pill" data-o="upper">转大写</button>
            <button class="pill" data-o="lower">转小写</button>
            <button class="pill" data-o="trim">去首尾空格</button>
            <button class="pill" data-o="blank">去空行</button>
            <button class="pill" data-o="dedup">行去重</button>
            <button class="pill" data-o="num">添加行号</button>
            <button class="pill" data-o="cn2en">中文标点→英文</button>
            <button class="pill" data-o="en2cn">英文标点→中文</button>
            <button class="pill" data-o="reverse">字符倒序</button>
          </div>
          <div class="btn-group">
            <button class="btn-sm secondary" id="ttCopy">复制文本</button>
            <button class="btn-sm secondary" id="ttDownload">下载 TXT</button>
            <button class="btn-sm danger" id="ttClear">清空</button>
          </div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    const ta = $('ttText');
    function stats() {
      const v = ta.value;
      const cn = (v.match(/[\u4e00-\u9fa5]/g) || []).length;
      const words = (v.match(/\b\w+\b/g) || []).length;
      const lines = v ? v.split('\n').length : 0;
      const bytes = new TextEncoder().encode(v).length;
      $('ttStats').innerHTML = `字符数：<b>${v.length}</b><br>中文字数：<b>${cn}</b><br>单词数：<b>${words}</b><br>行数：<b>${lines}</b><br>字节数：<b>${bytes}</b>`;
    }
    ta.addEventListener('input', stats);
    const pairs = { '，': ',', '。': '.', '；': ';', '：': ':', '？': '?', '！': '!', '（': '(', '）': ')', '【': '[', '】': ']', '“': '"', '”': '"', '、': ',' };
    $('ttOps').addEventListener('click', function (e) {
      const b = e.target.closest('[data-o]'); if (!b) return;
      let v = ta.value;
      switch (b.dataset.o) {
        case 'upper': v = v.toUpperCase(); break;
        case 'lower': v = v.toLowerCase(); break;
        case 'trim': v = v.split('\n').map(function (l) { return l.trim(); }).join('\n'); break;
        case 'blank': v = v.split('\n').filter(function (l) { return l.trim(); }).join('\n'); break;
        case 'dedup': v = Array.from(new Set(v.split('\n'))).join('\n'); break;
        case 'num': v = v.split('\n').map(function (l, i) { return (i + 1) + '. ' + l; }).join('\n'); break;
        case 'reverse': v = v.split('').reverse().join(''); break;
        case 'cn2en': Object.keys(pairs).forEach(function (k) { v = v.split(k).join(pairs[k]); }); break;
        case 'en2cn': Object.keys(pairs).forEach(function (k) { v = v.split(pairs[k]).join(k); }); break;
      }
      ta.value = v; stats(); U.toast('处理完成');
    });
    $('ttCopy').addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(function () { U.toast('已复制'); });
      else { ta.select(); document.execCommand('copy'); U.toast('已复制'); }
    });
    $('ttDownload').addEventListener('click', function () {
      U.downloadBlob(new Blob([ta.value], { type: 'text/plain;charset=utf-8' }), 'text-' + Date.now() + '.txt');
    });
    $('ttClear').addEventListener('click', function () { ta.value = ''; stats(); });
  }
});
