/* 图片压缩 */
registerTool({
  id: 'image-compress',
  name: '图片压缩',
  icon: '🗜️',
  category: 'image',
  desc: '调整画质与尺寸，大幅减小图片体积，支持 JPG / PNG / WebP 输出。',
  badge: '热门',
  run: function (root) {
    const U = window.ToolUtil;
    let file = null, img = null;

    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="tool-section">
            <label class="tool-label">1. 选择图片</label>
            <div class="drop-zone" id="icZone">
              <span class="dz-icon">📷</span>
              <span class="dz-title">点击或拖拽图片到这里</span>
              <span class="dz-sub">支持 JPG / PNG / WebP / GIF</span>
              <input type="file" id="icInput" accept="image/*">
            </div>
          </div>
          <div class="tool-section">
            <label class="tool-label">2. 压缩设置</label>
            <div class="field">
              <label>输出格式</label>
              <select id="icFormat">
                <option value="image/jpeg">JPG（体积小，无透明）</option>
                <option value="image/webp">WebP（体积更小）</option>
                <option value="image/png">PNG（保留透明）</option>
              </select>
            </div>
            <div class="field">
              <label>画质：<span id="icQualityVal">80</span>%</label>
              <input type="range" id="icQuality" min="10" max="100" value="80">
            </div>
            <div class="field">
              <label>最大宽度：<span id="icWidthVal">保持原尺寸</span></label>
              <input type="range" id="icWidth" min="0" max="4000" step="100" value="0">
              <div class="tool-hint">拖动到 0 表示保持原始宽度</div>
            </div>
          </div>
          <button class="btn-sm" id="icBtn" style="width:100%" disabled>开始压缩</button>
        </div>
        <div class="tool-col">
          <label class="tool-label">预览与结果</label>
          <div class="preview-box" id="icPreview"><span class="preview-placeholder">图片加载后显示预览</span></div>
          <div class="result-bar" id="icResult" hidden>
            <div>原始：<b id="icOrig">-</b></div>
            <div>压缩后：<b id="icNew">-</b></div>
            <div class="save" id="icSave"></div>
            <button class="btn-sm" id="icDownload">⬇️ 下载图片</button>
          </div>
        </div>
      </div>`;

    const $ = function (id) { return root.querySelector('#' + id); };
    const input = $('icInput'), zone = $('icZone'), preview = $('icPreview');
    const format = $('icFormat'), quality = $('icQuality'), widthRange = $('icWidth');
    const btn = $('icBtn');
    let resultBlob = null;

    U.bindDrop(zone, input, handleFile);
    quality.addEventListener('input', function () { $('icQualityVal').textContent = quality.value; });
    widthRange.addEventListener('input', function () {
      $('icWidthVal').textContent = widthRange.value == 0 ? '保持原尺寸' : widthRange.value + ' px';
    });
    format.addEventListener('change', function () {
      if (format.value === 'image/png') { quality.disabled = true; $('icQualityVal').textContent = '无损'; }
      else { quality.disabled = false; $('icQualityVal').textContent = quality.value; }
    });
    btn.addEventListener('click', compress);
    $('icDownload').addEventListener('click', function () {
      if (!resultBlob) return;
      const ext = format.value === 'image/jpeg' ? 'jpg' : format.value.split('/')[1];
      U.downloadBlob(resultBlob, 'compressed-' + Date.now() + '.' + ext);
      U.toast('已开始下载');
    });

    function handleFile(f) {
      if (!f.type.startsWith('image/')) { U.toast('请选择图片文件'); return; }
      file = f;
      const url = URL.createObjectURL(f);
      U.loadImage(url).then(function (loaded) {
        img = loaded;
        widthRange.max = img.width;
        widthRange.value = 0;
        $('icWidthVal').textContent = '保持原尺寸';
        preview.innerHTML = '';
        const im = document.createElement('img');
        im.src = url; preview.appendChild(im);
        btn.disabled = false;
        $('icResult').hidden = true;
      }).catch(function () { U.toast('图片加载失败'); });
    }

    async function compress() {
      if (!img) return;
      btn.disabled = true; btn.textContent = '压缩中…';
      try {
        let w = img.width, h = img.height;
        const maxW = parseInt(widthRange.value, 10);
        if (maxW > 0 && maxW < w) { h = Math.round(h * maxW / w); w = maxW; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (format.value === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
        ctx.drawImage(img, 0, 0, w, h);
        const q = format.value === 'image/png' ? undefined : parseInt(quality.value, 10) / 100;
        resultBlob = await U.canvasToBlob(canvas, format.value, q);
        $('icOrig').textContent = U.formatBytes(file.size);
        $('icNew').textContent = U.formatBytes(resultBlob.size);
        const ratio = Math.round((1 - resultBlob.size / file.size) * 100);
        $('icSave').textContent = ratio > 0 ? '已减小 ' + ratio + '%' : '体积略有增加，建议降低画质';
        $('icResult').hidden = false;
      } catch (e) { U.toast('压缩失败：' + e.message); }
      btn.disabled = false; btn.textContent = '开始压缩';
    }
  }
});
