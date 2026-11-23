/* 图片水印 */
registerTool({
  id: 'image-watermark',
  name: '图片加水印',
  icon: '💧',
  category: 'image',
  desc: '给图片添加文字水印，可调字体大小、颜色、透明度与位置，支持平铺。',
  run: function (root) {
    const U = window.ToolUtil;
    let img = null;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="tool-section">
            <label class="tool-label">1. 选择图片</label>
            <div class="drop-zone" id="wmZone">
              <span class="dz-icon">💧</span><span class="dz-title">点击或拖拽图片</span>
              <input type="file" id="wmInput" accept="image/*">
            </div>
          </div>
          <div class="field"><label>水印文字</label><input type="text" id="wmText" value="RoutineMiku" placeholder="输入水印文字"></div>
          <div class="field"><label>字体大小：<span id="wmSizeVal">36</span>px</label><input type="range" id="wmSize" min="12" max="120" value="36"></div>
          <div class="field"><label>透明度：<span id="wmAlphaVal">40</span>%</label><input type="range" id="wmAlpha" min="5" max="100" value="40"></div>
          <div class="field"><label>颜色</label><input type="color" id="wmColor" value="#ffffff"></div>
          <div class="field"><label>位置</label>
            <select id="wmPos" class="tool-input">
              <option value="se">右下角</option><option value="sw">左下角</option>
              <option value="ne">右上角</option><option value="nw">左上角</option>
              <option value="center">居中</option><option value="tile">平铺整图</option>
            </select>
          </div>
          <div class="btn-group">
            <button class="btn-sm" id="wmBtn" disabled>生成预览</button>
            <button class="btn-sm secondary" id="wmDownload" disabled>⬇️ 下载</button>
          </div>
        </div>
        <div class="tool-col">
          <label class="tool-label">预览</label>
          <div class="preview-box" id="wmPreview"><span class="preview-placeholder">上传图片后显示效果</span></div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    let resultURL = null;
    U.bindDrop($('wmZone'), $('wmInput'), function (f) {
      if (!f.type.startsWith('image/')) { U.toast('请选择图片'); return; }
      const url = URL.createObjectURL(f);
      U.loadImage(url).then(function (l) {
        img = l;
        $('wmPreview').innerHTML = '';
        const im = document.createElement('img'); im.src = url; $('wmPreview').appendChild(im);
        $('wmBtn').disabled = false;
      }).catch(function () { U.toast('图片加载失败'); });
    });
    $('wmSize').addEventListener('input', function () { $('wmSizeVal').textContent = this.value; });
    $('wmAlpha').addEventListener('input', function () { $('wmAlphaVal').textContent = this.value; });

    function hexToRgba(hex, a) {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
    }
    function render() {
      if (!img) return;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const text = $('wmText').value || 'RoutineMiku';
      const size = parseInt($('wmSize').value, 10);
      const alpha = parseInt($('wmAlpha').value, 10) / 100;
      ctx.font = `bold ${size}px sans-serif`;
      ctx.fillStyle = hexToRgba($('wmColor').value, alpha);
      const pos = $('wmPos').value;
      const pad = Math.round(size * 0.6);
      const tw = ctx.measureText(text).width;
      if (pos === 'tile') {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6);
        const stepX = tw + size * 3, stepY = size * 3;
        for (let y = -canvas.height; y < canvas.height; y += stepY)
          for (let x = -canvas.width; x < canvas.width; x += stepX)
            ctx.fillText(text, x, y);
        ctx.restore();
      } else {
        let x, y;
        if (pos.includes('e')) x = canvas.width - tw - pad; else if (pos.includes('w')) x = pad; else x = (canvas.width - tw) / 2;
        if (pos.includes('s')) y = canvas.height - pad; else if (pos.includes('n')) y = size + pad; else y = canvas.height / 2;
        ctx.fillText(text, x, y);
      }
      resultURL = canvas.toDataURL('image/png');
      $('wmPreview').innerHTML = '';
      const im = document.createElement('img'); im.src = resultURL; $('wmPreview').appendChild(im);
      $('wmDownload').disabled = false;
    }
    $('wmBtn').addEventListener('click', render);
    $('wmDownload').addEventListener('click', function () {
      if (resultURL) U.downloadDataURL(resultURL, 'watermarked-' + Date.now() + '.png');
    });
  }
});
