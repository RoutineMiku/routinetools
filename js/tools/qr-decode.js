/* 二维码解码 / 识别 */
registerTool({
  id: 'qr-decode',
  name: '二维码解码',
  icon: '🔍',
  category: 'image',
  desc: '上传包含二维码的图片，自动识别其中的文字、链接或 WiFi 信息。',
  badge: 'NEW',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="drop-zone" id="qdZone"><span class="dz-icon">🔍</span>
            <span class="dz-title">上传二维码图片</span><span class="dz-sub">点击或拖拽，支持截图</span>
            <input type="file" id="qdInput" accept="image/*"></div>
          <div class="info-note" style="margin-top:14px">💡 识别完全在浏览器本地完成，图片不会上传。支持 QR Code 格式。</div>
        </div>
        <div class="tool-col">
          <label class="tool-label">识别结果</label>
          <div class="preview-box" id="qdPreview" style="min-height:180px"><span class="preview-placeholder">上传图片后显示</span></div>
          <div class="field" style="margin-top:14px"><label>内容</label>
            <textarea id="qdResult" readonly style="min-height:90px"></textarea></div>
          <div class="btn-group">
            <button class="btn-sm" id="qdCopy" disabled>复制内容</button>
            <button class="btn-sm secondary" id="qdOpen" disabled>在浏览器打开链接</button>
          </div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    U.bindDrop($('qdZone'), $('qdInput'), async function (f) {
      if (!f.type.startsWith('image/')) { U.toast('请选择图片'); return; }
      try {
        const url = URL.createObjectURL(f);
        const img = await U.loadImage(url);
        $('qdPreview').innerHTML = '';
        const im = document.createElement('img'); im.src = url; $('qdPreview').appendChild(im);
        await U.loadScript('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js');
        if (!window.jsQR) throw new Error('解码组件加载失败');
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = window.jsQR(data.data, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        if (!result) { $('qdResult').value = ''; U.toast('未在图片中识别到二维码'); $('qdCopy').disabled = true; $('qdOpen').disabled = true; return; }
        $('qdResult').value = result.data;
        $('qdCopy').disabled = false;
        $('qdOpen').disabled = !/^https?:\/\//i.test(result.data);
        U.toast('识别成功');
      } catch (e) { U.toast('识别失败：' + e.message); }
    });
    $('qdCopy').addEventListener('click', function () {
      const el = $('qdResult');
      if (navigator.clipboard) navigator.clipboard.writeText(el.value).then(function () { U.toast('已复制'); });
      else { el.select(); document.execCommand('copy'); U.toast('已复制'); }
    });
    $('qdOpen').addEventListener('click', function () { window.open($('qdResult').value, '_blank', 'noopener'); });
  }
});
