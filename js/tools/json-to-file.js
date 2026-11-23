/* JSON 内容转换 / 下载为 .json 文件 */
registerTool({
  id: 'json-to-file',
  name: 'JSON 转文件',
  icon: '📦',
  category: 'document',
  desc: '粘贴 JSON 内容，实时校验、格式化（压缩/美化）并下载为 .json 文件。',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col">
          <div class="field">
            <label>JSON 内容（可直接粘贴，或从文件读取）</label>
            <textarea id="jsfText" placeholder='例如：{"name":"RoutineMiku","tools":["PDF","图片压缩"]}' style="min-height:280px"></textarea>
          </div>
          <div class="tool-hint" id="jsfStatus">等待输入…</div>
          <div class="btn-group">
            <button class="btn-sm" id="jsfFormat">✨ 美化格式</button>
            <button class="btn-sm secondary" id="jsfMinify">📦 压缩一行</button>
            <button class="btn-sm secondary" id="jsfLoad">📂 从文件读取</button>
            <button class="btn-sm danger" id="jsfClear">清空</button>
            <input type="file" id="jsfFile" accept=".json,application/json" hidden>
          </div>
        </div>
        <div class="tool-col narrow">
          <div class="field"><label>文件名</label><input type="text" id="jsfName" value="data.json"></div>
          <div class="field"><label>统计信息</label>
            <div class="info-note" id="jsfStats">尚未解析到有效 JSON</div>
          </div>
          <button class="btn-sm" id="jsfDownload" style="width:100%" disabled>⬇️ 下载 JSON 文件</button>
          <div class="tool-hint" style="margin-top:10px">文件仅在你的浏览器中生成，不会上传到任何服务器。</div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    const ta = $('jsfText');

    function validate() {
      const v = ta.value.trim();
      const status = $('jsfStatus'), stats = $('jsfStats'), dl = $('jsfDownload');
      if (!v) { status.textContent = '等待输入…'; stats.textContent = '尚未解析到有效 JSON'; dl.disabled = true; return null; }
      try {
        const obj = JSON.parse(v);
        status.innerHTML = '<span style="color:#16a34a">✔ JSON 格式有效</span>';
        const size = new Blob([v]).size;
        const kind = Array.isArray(obj) ? '数组' : (obj && typeof obj === 'object' ? '对象' : typeof obj);
        const count = Array.isArray(obj) ? obj.length : (obj && typeof obj === 'object' ? Object.keys(obj).length : '-');
        stats.innerHTML = `类型：${kind}<br>元素/字段数：${count}<br>大小：${U.formatBytes(size)}`;
        dl.disabled = false;
        return obj;
      } catch (e) {
        status.innerHTML = '<span style="color:#e33">✘ JSON 格式错误：' + e.message + '</span>';
        stats.textContent = '请先修正 JSON 格式';
        dl.disabled = true;
        return null;
      }
    }
    ta.addEventListener('input', validate);
    $('jsfFormat').addEventListener('click', function () {
      const obj = validate(); if (obj == null) return U.toast('JSON 格式有误');
      ta.value = JSON.stringify(obj, null, 2); validate(); U.toast('已美化格式');
    });
    $('jsfMinify').addEventListener('click', function () {
      const obj = validate(); if (obj == null) return U.toast('JSON 格式有误');
      ta.value = JSON.stringify(obj); validate(); U.toast('已压缩为一行');
    });
    $('jsfClear').addEventListener('click', function () { ta.value = ''; validate(); });
    $('jsfLoad').addEventListener('click', function () { $('jsfFile').click(); });
    $('jsfFile').addEventListener('change', function () {
      const f = this.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = function () { ta.value = r.result; $('jsfName').value = f.name; validate(); };
      r.readAsText(f);
    });
    $('jsfDownload').addEventListener('click', function () {
      const obj = validate(); if (obj == null) return;
      let name = $('jsfName').value.trim() || 'data.json';
      if (!name.toLowerCase().endsWith('.json')) name += '.json';
      U.downloadBlob(new Blob([ta.value], { type: 'application/json;charset=utf-8' }), name);
      U.toast('已开始下载：' + name);
    });
  }
});
