/* 一寸照片制作（证件照尺寸 + 打印排版） */
registerTool({
  id: 'id-photo',
  name: '一寸照片制作',
  icon: '🪪',
  category: 'image',
  desc: '按标准尺寸裁剪证件照，可调背景色与位置，一键生成打印排版图。',
  badge: '热门',
  run: function (root) {
    const U = window.ToolUtil;
    // 常见证件照规格（300dpi 下的像素尺寸）
    const presets = {
      '一寸':   [295, 413], '小一寸': [260, 378], '大一寸': [390, 567],
      '二寸':   [413, 579], '小二寸': [390, 485], '大二寸': [485, 655],
      '护照':   [354, 472], '签证':   [354, 472]
    };
    const papers = { '6寸照片纸': [1800, 1200], 'A4纸': [2480, 3508] };
    const colors = { '白色': '#ffffff', '蓝色': '#4387d4', '红色': '#d42b2b' };

    let img = null, singleCanvas = null;

    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="tool-section">
            <label class="tool-label">1. 上传照片</label>
            <div class="drop-zone" id="idZone">
              <span class="dz-icon">🧑‍🎤</span>
              <span class="dz-title">点击或拖拽照片到这里</span>
              <span class="dz-sub">建议正面免冠、光线均匀的照片</span>
              <input type="file" id="idInput" accept="image/*">
            </div>
          </div>
          <div class="tool-section">
            <label class="tool-label">2. 照片规格</label>
            <select id="idPreset" class="tool-input">
              ${Object.keys(presets).map(k => `<option value="${k}">${k}（${presets[k][0]}×${presets[k][1]}px）</option>`).join('')}
            </select>
          </div>
          <div class="tool-section">
            <label class="tool-label">3. 背景色</label>
            <div class="pill-group" id="idColors">
              ${Object.keys(colors).map((k, i) => `<button class="pill ${i === 0 ? 'active' : ''}" data-c="${colors[k]}">${k}</button>`).join('')}
              <input type="color" id="idCustomColor" value="#ffffff" title="自定义颜色">
            </div>
            <div class="tool-hint">背景色用于填充透明区域与留白边缘；如需替换纯色背景，请先用抠图工具处理。</div>
          </div>
          <div class="tool-section">
            <label class="tool-label">4. 位置微调</label>
            <div class="field"><label>缩放：<span id="idZoomVal">100</span>%</label>
              <input type="range" id="idZoom" min="100" max="300" value="100"></div>
            <div class="field"><label>上下移动：<span id="idOffsetVal">0</span></label>
              <input type="range" id="idOffset" min="-300" max="300" value="0"></div>
          </div>
          <div class="btn-group">
            <button class="btn-sm" id="idMake" disabled>生成证件照</button>
            <button class="btn-sm secondary" id="idSheet" disabled>打印排版</button>
          </div>
        </div>
        <div class="tool-col">
          <label class="tool-label">预览</label>
          <div class="preview-box" id="idPreview"><span class="preview-placeholder">上传照片后显示效果</span></div>
          <div class="tool-section" id="idPaperWrap" style="display:none;margin-top:16px">
            <label class="tool-label">打印纸张</label>
            <select id="idPaper" class="tool-input">
              ${Object.keys(papers).map(k => `<option value="${k}">${k}（${papers[k][0]}×${papers[k][1]}px）</option>`).join('')}
            </select>
          </div>
          <div class="result-bar" id="idResult" hidden>
            <div id="idInfo">尺寸：- · 背景：-</div>
            <button class="btn-sm" id="idDownload">⬇️ 下载单张</button>
            <button class="btn-sm secondary" id="idDownloadSheet" hidden>⬇️ 下载排版图</button>
          </div>
        </div>
      </div>`;

    const $ = function (id) { return root.querySelector('#' + id); };
    let bg = '#ffffff', sheetDataURL = null;
    U.bindDrop($('idZone'), $('idInput'), function (f) {
      if (!f.type.startsWith('image/')) { U.toast('请选择图片'); return; }
      const url = URL.createObjectURL(f);
      U.loadImage(url).then(function (loaded) {
        img = loaded;
        $('idPreview').innerHTML = '';
        const im = document.createElement('img'); im.src = url;
        im.style.maxHeight = '300px'; $('idPreview').appendChild(im);
        $('idMake').disabled = false; $('idSheet').disabled = false;
      }).catch(function () { U.toast('图片加载失败'); });
    });
    $('idColors').addEventListener('click', function (e) {
      const b = e.target.closest('[data-c]');
      if (!b) return;
      this.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); bg = b.dataset.c;
    });
    $('idCustomColor').addEventListener('input', function () { bg = this.value; });
    $('idZoom').addEventListener('input', function () { $('idZoomVal').textContent = this.value; });
    $('idOffset').addEventListener('input', function () { $('idOffsetVal').textContent = this.value; });

    function makeSingle() {
      const [tw, th] = presets[$('idPreset').value];
      const zoom = parseInt($('idZoom').value, 10) / 100;
      const offset = parseInt($('idOffset').value, 10);
      const canvas = document.createElement('canvas');
      canvas.width = tw; canvas.height = th;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, tw, th);
      const scale = Math.max(tw / img.width, th / img.height) * zoom;
      const dw = img.width * scale, dh = img.height * scale;
      const dx = (tw - dw) / 2, dy = (th - dh) / 2 + offset;
      ctx.drawImage(img, dx, dy, dw, dh);
      return canvas;
    }

    $('idMake').addEventListener('click', function () {
      if (!img) return;
      singleCanvas = makeSingle();
      $('idPreview').innerHTML = '';
      const im = document.createElement('img');
      im.src = singleCanvas.toDataURL('image/png'); $('idPreview').appendChild(im);
      const [w, h] = presets[$('idPreset').value];
      $('idInfo').textContent = `尺寸：${w}×${h}px · 背景：${bg} · ${$('idPreset').value}`;
      $('idDownloadSheet').hidden = true;
      $('idResult').hidden = false;
    });

    function makeSheet() {
      if (!img) return;
      singleCanvas = makeSingle();
      const [pw, ph] = papers[$('idPaper').value];
      const [w, h] = presets[$('idPreset').value];
      const gap = 20;
      const cols = Math.max(1, Math.floor((pw + gap) / (w + gap)));
      const rows = Math.max(1, Math.floor((ph + gap) / (h + gap)));
      const sheet = document.createElement('canvas');
      sheet.width = pw; sheet.height = ph;
      const ctx = sheet.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, pw, ph);
      const startX = (pw - (cols * w + (cols - 1) * gap)) / 2;
      const startY = (ph - (rows * h + (rows - 1) * gap)) / 2;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        ctx.drawImage(singleCanvas, startX + c * (w + gap), startY + r * (h + gap));
      }
      sheetDataURL = sheet.toDataURL('image/jpeg', 0.95);
      $('idPreview').innerHTML = '';
      const im = document.createElement('img'); im.src = sheetDataURL;
      $('idPreview').appendChild(im);
      $('idInfo').textContent = `排版：${$('idPaper').value} · ${cols}列×${rows}行 = ${cols * rows} 张`;
      $('idDownloadSheet').hidden = false;
      $('idResult').hidden = false;
    }

    $('idSheet').addEventListener('click', function () {
      if (!img) return;
      if (!singleCanvas) singleCanvas = makeSingle();
      $('idPaperWrap').style.display = 'block';
      makeSheet();
    });
    $('idPaper').addEventListener('change', makeSheet);
    $('idDownload').addEventListener('click', function () {
      if (!singleCanvas) return;
      U.downloadDataURL(singleCanvas.toDataURL('image/png'), '证件照-' + $('idPreset').value + '.png');
    });
    $('idDownloadSheet').addEventListener('click', function () {
      if (!sheetDataURL) return;
      U.downloadDataURL(sheetDataURL, '证件照排版-' + $('idPaper').value + '.jpg');
    });
  }
});
