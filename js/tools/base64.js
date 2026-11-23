/* Base64 编码解码 */
registerTool({
  id: 'base64',
  name: 'Base64 编码/解码',
  icon: '🔠',
  category: 'network',
  desc: '文本与 Base64 互相转换，完美支持中文等 UTF-8 字符。',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col">
          <div class="field"><label>原始文本</label><textarea id="b64Src" placeholder="输入要编码的文本…"></textarea></div>
          <div class="btn-group">
            <button class="btn-sm" id="b64Enc">编码 → Base64</button>
            <button class="btn-sm secondary" id="b64CopySrc">复制文本</button>
          </div>
        </div>
        <div class="tool-col">
          <div class="field"><label>Base64 结果</label><textarea id="b64Out" placeholder="Base64 结果将显示在这里，也可粘贴内容进行解码"></textarea></div>
          <div class="btn-group">
            <button class="btn-sm" id="b64Dec">← 解码为文本</button>
            <button class="btn-sm secondary" id="b64CopyOut">复制结果</button>
          </div>
        </div>
      </div>
      <div class="info-note" style="margin-top:18px">💡 编码用于在网络传输中安全表示二进制/中文数据；解码时请确保输入是合法的 Base64 字符串。</div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    function encodeUtf8(str) {
      const bytes = new TextEncoder().encode(str);
      let bin = ''; bytes.forEach(function (b) { bin += String.fromCharCode(b); });
      return btoa(bin);
    }
    function decodeUtf8(b64) {
      const bin = atob(b64.replace(/\s/g, ''));
      const bytes = Uint8Array.from(bin, function (c) { return c.charCodeAt(0); });
      return new TextDecoder().decode(bytes);
    }
    function copy(id) {
      const el = $(id);
      if (navigator.clipboard) navigator.clipboard.writeText(el.value).then(function () { U.toast('已复制'); });
      else { el.select(); document.execCommand('copy'); U.toast('已复制'); }
    }
    $('b64Enc').addEventListener('click', function () {
      try { $('b64Out').value = encodeUtf8($('b64Src').value); U.toast('编码完成'); }
      catch (e) { U.toast('编码失败：' + e.message); }
    });
    $('b64Dec').addEventListener('click', function () {
      try { $('b64Src').value = decodeUtf8($('b64Out').value); U.toast('解码完成'); }
      catch (e) { U.toast('解码失败：请输入合法 Base64'); }
    });
    $('b64CopySrc').addEventListener('click', function () { copy('b64Src'); });
    $('b64CopyOut').addEventListener('click', function () { copy('b64Out'); });
  }
});
