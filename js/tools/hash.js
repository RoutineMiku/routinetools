/* 哈希计算 */
registerTool({
  id: 'hash',
  name: 'Hash 哈希计算',
  icon: '#️⃣',
  category: 'network',
  desc: '计算文本或文件的 SHA-1 / SHA-256 / SHA-384 / SHA-512 摘要。',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col">
          <div class="field"><label>输入文本</label><textarea id="hsText" placeholder="输入要计算哈希的文本…" style="min-height:120px"></textarea></div>
          <button class="btn-sm" id="hsTextBtn">计算文本哈希</button>
          <div class="tool-section" style="margin-top:20px">
            <label class="tool-label">或选择文件</label>
            <div class="drop-zone" id="hsZone"><span class="dz-icon">#️⃣</span>
              <span class="dz-title">点击或拖拽文件计算哈希</span>
              <input type="file" id="hsFile"></div>
          </div>
        </div>
        <div class="tool-col">
          <label class="tool-label">计算结果</label>
          <div id="hsResults">
            <div class="info-note">尚无结果</div>
          </div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
    function hex(buf) { return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''); }
    async function compute(data) {
      if (!window.crypto || !crypto.subtle) { U.toast('当前环境不支持 Web Crypto（需 HTTPS 或 localhost）'); return; }
      const results = await Promise.all(algos.map(function (a) { return crypto.subtle.digest(a, data); }));
      $('hsResults').innerHTML = algos.map(function (a, i) {
        return `<div class="field"><label>${a}</label>
          <input type="text" class="tool-input hsVal" readonly value="${hex(results[i])}"></div>`;
      }).join('') + '<button class="btn-sm secondary" id="hsCopyAll">复制全部结果</button>';
      $('hsCopyAll').addEventListener('click', function () {
        const text = Array.from(root.querySelectorAll('.hsVal')).map(function (el, i) { return algos[i] + ': ' + el.value; }).join('\n');
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { U.toast('已复制'); });
        else U.toast('请手动复制');
      });
      U.toast('计算完成');
    }
    $('hsTextBtn').addEventListener('click', function () {
      compute(new TextEncoder().encode($('hsText').value));
    });
    U.bindDrop($('hsZone'), $('hsFile'), async function (f) {
      try {
        U.toast('正在计算文件哈希…');
        compute(await U.readAsArrayBuffer(f));
      } catch (e) { U.toast('读取失败：' + e.message); }
    });
  }
});
