/* 二维码生成器 */
registerTool({
  id: 'qrcode',
  name: '二维码生成',
  icon: '🔳',
  category: 'image',
  desc: '把文字、链接、WiFi 信息生成二维码，可自定义颜色与尺寸并下载图片。',
  badge: 'NEW',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="field"><label>二维码内容</label><textarea id="qrText" style="min-height:100px" placeholder="输入文字 / 链接 / WiFi 信息">https://github.com/RoutineMiku/routinetools</textarea></div>
          <div class="field"><label>快捷模板</label>
            <div class="pill-group" id="qrTpl">
              <button class="pill" data-t="url">网址</button>
              <button class="pill" data-t="wifi">WiFi</button>
              <button class="pill" data-t="text">纯文本</button>
            </div>
          </div>
          <div class="field"><label>尺寸：<span id="qrSizeVal">300</span>px</label><input type="range" id="qrSize" min="128" max="800" step="20" value="300"></div>
          <div class="field"><label>前景色 <input type="color" id="qrFg" value="#1f2740"></label>
            <label style="margin-top:8px">背景色 <input type="color" id="qrBg" value="#ffffff"></label></div>
          <div class="field"><label>容错级别</label><select id="qrEc" class="tool-input">
            <option value="M">M（默认 15%）</option><option value="L">L（7%）</option>
            <option value="Q">Q（25%）</option><option value="H">H（30%）</option></select></div>
          <button class="btn-sm" id="qrBtn" style="width:100%">生成二维码</button>
        </div>
        <div class="tool-col">
          <label class="tool-label">预览</label>
          <div class="preview-box" id="qrPreview" style="min-height:320px">
            <span class="preview-placeholder">点击左侧按钮生成</span></div>
          <div class="btn-group"><button class="btn-sm secondary" id="qrDownload" disabled>⬇️ 下载 PNG</button>
            <button class="btn-sm secondary" id="qrCopy" disabled>复制图片</button></div>
        </div>
      </div>
      <div id="qrWifiForm" class="info-note" style="display:none;margin-top:16px">
        <div class="tool-row">
          <div class="field tool-col"><label>网络名称 SSID</label><input type="text" id="wifiSsid" class="tool-input" placeholder="WiFi 名称"></div>
          <div class="field tool-col"><label>密码</label><input type="text" id="wifiPass" class="tool-input" placeholder="WiFi 密码"></div>
        </div>
        <div class="field"><label>加密方式</label><select id="wifiEnc" class="tool-input">
          <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">无密码</option></select></div>
        <button class="btn-sm" id="wifiBuild">填入内容框</button>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    let dataURL = null;
    $('qrSize').addEventListener('input', function () { $('qrSizeVal').textContent = this.value; });
    $('qrTpl').addEventListener('click', function (e) {
      const b = e.target.closest('[data-t]'); if (!b) return;
      this.querySelectorAll('.pill').forEach(x => x.classList.remove('active')); b.classList.add('active');
      $('qrWifiForm').style.display = b.dataset.t === 'wifi' ? 'block' : 'none';
    });
    $('wifiBuild').addEventListener('click', function () {
      const enc = $('wifiEnc').value;
      $('qrText').value = 'WIFI:T:' + enc + ';S:' + $('wifiSsid').value + ';' +
        (enc === 'nopass' ? '' : 'P:' + $('wifiPass').value + ';') + ';;';
      U.toast('已填入内容框');
    });
    $('qrBtn').addEventListener('click', async function () {
      const text = $('qrText').value.trim();
      if (!text) { U.toast('请输入二维码内容'); return; }
      const btn = this; btn.disabled = true; btn.textContent = '生成中…';
      try {
        await U.loadScript('https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js');
        if (!window.QRCode) throw new Error('二维码组件加载失败');
        dataURL = await window.QRCode.toDataURL(text, {
          width: parseInt($('qrSize').value, 10), margin: 2,
          color: { dark: $('qrFg').value, light: $('qrBg').value },
          errorCorrectionLevel: $('qrEc').value
        });
        $('qrPreview').innerHTML = '<img src="' + dataURL + '" alt="二维码">';
        $('qrDownload').disabled = false; $('qrCopy').disabled = false;
      } catch (e) { U.toast('生成失败：' + e.message); }
      btn.disabled = false; btn.textContent = '生成二维码';
    });
    $('qrDownload').addEventListener('click', function () {
      if (dataURL) U.downloadDataURL(dataURL, 'qrcode-' + Date.now() + '.png');
    });
    $('qrCopy').addEventListener('click', async function () {
      if (!dataURL) return;
      try {
        const blob = await (await fetch(dataURL)).blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        U.toast('图片已复制');
      } catch (e) { U.toast('复制失败，请使用下载按钮'); }
    });
  }
});
