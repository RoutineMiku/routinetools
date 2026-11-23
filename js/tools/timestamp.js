/* 时间戳转换 */
registerTool({
  id: 'timestamp',
  name: '时间戳转换',
  icon: '⏱️',
  category: 'network',
  desc: 'Unix 时间戳与日期时间互相转换，支持秒/毫秒、当前时间与 UTC 显示。',
  badge: 'NEW',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col">
          <div class="field"><label>时间戳（秒 或 毫秒）</label>
            <input type="text" id="tsInput" class="tool-input" placeholder="例如：1700000000">
            <div class="tool-hint">10 位为秒，13 位为毫秒，输入后自动转换</div></div>
          <div class="field"><label>转换结果</label>
            <div class="info-note" id="tsResult" style="line-height:2">等待输入…</div></div>
          <button class="btn-sm secondary" id="tsNow">填入当前时间戳</button>
        </div>
        <div class="tool-col">
          <div class="field"><label>日期时间 → 时间戳</label>
            <input type="datetime-local" id="tsDate" class="tool-input"></div>
          <div class="field"><label>结果</label>
            <div class="info-note" id="tsBack" style="line-height:2">选择日期后显示</div></div>
          <div class="info-note" id="tsTick" style="background:#f8faff;border-left-color:#4f6ef7">当前时间加载中…</div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    function pad(n) { return String(n).padStart(2, '0'); }
    function fmt(d) {
      return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + ' ' +
        pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }
    function conv() {
      const v = $('tsInput').value.trim();
      if (!/^\d+$/.test(v)) { $('tsResult').textContent = '请输入纯数字时间戳'; return; }
      let n = parseInt(v, 10);
      if (v.length <= 10) n *= 1000;
      const d = new Date(n);
      if (isNaN(d.getTime())) { $('tsResult').textContent = '时间戳超出有效范围'; return; }
      $('tsResult').innerHTML = `本地时间：<b>${fmt(d)}</b><br>UTC 时间：<b>${d.toUTCString()}</b><br>秒级：<b>${Math.floor(n/1000)}</b> · 毫秒级：<b>${n}</b>`;
    }
    $('tsInput').addEventListener('input', conv);
    $('tsNow').addEventListener('click', function () { $('tsInput').value = Math.floor(Date.now()/1000); conv(); });
    $('tsDate').addEventListener('input', function () {
      if (!this.value) return;
      const t = new Date(this.value).getTime();
      $('tsBack').innerHTML = `秒级：<b>${Math.floor(t/1000)}</b><br>毫秒级：<b>${t}</b><br>UTC：<b>${new Date(t).toUTCString()}</b>`;
    });
    function tick() {
      const d = new Date();
      $('tsTick').innerHTML = `🕐 当前本地时间：<b>${fmt(d)}</b><br>当前时间戳：<b>${Math.floor(d.getTime()/1000)}</b> 秒`;
    }
    tick(); setInterval(tick, 1000); conv();
  }
});
