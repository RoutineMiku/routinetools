/* 随机密码生成器 */
registerTool({
  id: 'password',
  name: '密码生成器',
  icon: '🔐',
  category: 'network',
  desc: '生成高强度随机密码，可自定义长度与字符类型，并评估密码强度。',
  badge: 'NEW',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="field"><label>密码长度：<span id="pwLenVal">16</span></label><input type="range" id="pwLen" min="4" max="64" value="16"></div>
          <div class="field"><label>字符类型</label>
            <label class="check"><input type="checkbox" id="pwLower" checked> 小写字母 a-z</label>
            <label class="check"><input type="checkbox" id="pwUpper" checked> 大写字母 A-Z</label>
            <label class="check"><input type="checkbox" id="pwDigit" checked> 数字 0-9</label>
            <label class="check"><input type="checkbox" id="pwSymbol" checked> 特殊符号 !@#</label>
          </div>
          <div class="field"><label class="check"><input type="checkbox" id="pwNoSimilar"> 排除易混淆字符 (0/O/1/l/I)</label></div>
          <button class="btn-sm" id="pwBtn" style="width:100%">🎲 生成密码</button>
        </div>
        <div class="tool-col">
          <label class="tool-label">生成结果</label>
          <div class="preview-box" style="display:block;padding:20px;min-height:120px">
            <div id="pwValue" style="font-family:ui-monospace,Consolas,monospace;font-size:22px;word-break:break-all;color:var(--primary);font-weight:700">点击左侧按钮生成</div>
          </div>
          <div style="margin-top:14px"><label class="tool-label">强度：<span id="pwLevel">-</span></label>
            <div style="height:8px;border-radius:6px;background:#eef1f8;overflow:hidden"><div id="pwBar" style="height:100%;width:0;background:#22c3c6;transition:.3s"></div></div>
          </div>
          <div class="btn-group"><button class="btn-sm" id="pwCopy" disabled>复制密码</button>
            <button class="btn-sm secondary" id="pwAgain">再生成一个</button></div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    $('pwLen').addEventListener('input', function () { $('pwLenVal').textContent = this.value; });
    function generate() {
      let chars = '';
      if ($('pwLower').checked) chars += 'abcdefghijkmnopqrstuvwxyz';
      if ($('pwUpper').checked) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      if ($('pwDigit').checked) chars += '23456789';
      if ($('pwSymbol').checked) chars += '!@#$%^&*()-_=+[]{}?';
      if (!chars) { U.toast('请至少选择一种字符类型'); return; }
      if ($('pwNoSimilar').checked) chars = chars.replace(/[0O1lI]/g, '');
      const len = parseInt($('pwLen').value, 10);
      const arr = new Uint32Array(len);
      crypto.getRandomValues(arr);
      let pw = '';
      for (let i = 0; i < len; i++) pw += chars[arr[i] % chars.length];
      $('pwValue').textContent = pw;
      let score = Math.min(100, Math.round((len / 20) * 60 + (chars.length / 90) * 40));
      const level = score >= 80 ? '很强 🔒' : score >= 60 ? '强 ✔️' : score >= 40 ? '中等' : '较弱 ⚠️';
      $('pwLevel').textContent = level;
      $('pwBar').style.width = score + '%';
      $('pwBar').style.background = score >= 80 ? '#16a34a' : score >= 60 ? '#4f6ef7' : score >= 40 ? '#f5a623' : '#e33';
      $('pwCopy').disabled = false;
    }
    $('pwBtn').addEventListener('click', generate);
    $('pwAgain').addEventListener('click', generate);
    $('pwCopy').addEventListener('click', function () {
      const v = $('pwValue').textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () { U.toast('已复制'); });
      else U.toast('请使用浏览器复制');
    });
  }
});
