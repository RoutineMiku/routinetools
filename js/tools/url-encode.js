/* URL 编码解码 */
registerTool({
  id: 'url-encode',
  name: 'URL 编码/解码',
  icon: '🔗',
  category: 'network',
  desc: '对 URL 参数或文本进行 encodeURIComponent / encodeURI 编码与解码。',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col">
          <div class="field"><label>原始内容</label><textarea id="ueSrc" placeholder="输入 URL 或文本…"></textarea></div>
          <div class="field"><label>编码方式</label>
            <div class="pill-group" id="ueMode">
              <button class="pill active" data-m="component">encodeURIComponent（参数）</button>
              <button class="pill" data-m="uri">encodeURI（完整URL）</button>
            </div>
          </div>
          <button class="btn-sm" id="ueEnc">编码 →</button>
        </div>
        <div class="tool-col">
          <div class="field"><label>编码 / 解码结果</label><textarea id="ueOut"></textarea></div>
          <div class="btn-group">
            <button class="btn-sm" id="ueDec">← 解码</button>
            <button class="btn-sm secondary" id="ueCopy">复制结果</button>
          </div>
        </div>
      </div>
      <div class="info-note" style="margin-top:18px">💡 参数值用 encodeURIComponent（会编码 &amp; = ? 等符号）；完整链接用 encodeURI（保留 : / ? &amp; 等结构字符）。</div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    let mode = 'component';
    $('ueMode').addEventListener('click', function (e) {
      const b = e.target.closest('[data-m]'); if (!b) return;
      this.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); mode = b.dataset.m;
    });
    $('ueEnc').addEventListener('click', function () {
      const v = $('ueSrc').value;
      $('ueOut').value = mode === 'component' ? encodeURIComponent(v) : encodeURI(v);
    });
    $('ueDec').addEventListener('click', function () {
      try {
        $('ueSrc').value = mode === 'component' ? decodeURIComponent($('ueOut').value) : decodeURI($('ueOut').value);
        U.toast('解码完成');
      } catch (e) { U.toast('解码失败：' + e.message); }
    });
    $('ueCopy').addEventListener('click', function () {
      const el = $('ueOut');
      if (navigator.clipboard) navigator.clipboard.writeText(el.value).then(function () { U.toast('已复制'); });
      else { el.select(); document.execCommand('copy'); U.toast('已复制'); }
    });
  }
});
