/* 图片格式转换 */
registerTool({
  id: 'image-convert',
  name: '图片格式转换',
  icon: '🔄',
  category: 'image',
  desc: '批量在 JPG / PNG / WebP 之间转换，可一次处理多张图片。',
  run: function (root) {
    const U = window.ToolUtil;
    let files = [];
    root.innerHTML = `
      <div class="tool-section">
        <label class="tool-label">1. 选择图片（可多选）</label>
        <div class="drop-zone" id="cvZone">
          <span class="dz-icon">🖼️</span><span class="dz-title">点击选择或拖拽多张图片</span>
          <span class="dz-sub">支持 JPG / PNG / WebP / GIF / BMP</span>
          <input type="file" id="cvInput" accept="image/*" multiple>
        </div>
      </div>
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="field"><label>目标格式</label>
            <select id="cvFormat" class="tool-input">
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>
          <div class="field"><label>画质：<span id="cvQVal">90</span>%</label>
            <input type="range" id="cvQ" min="10" max="100" value="90"></div>
          <button class="btn-sm" id="cvBtn" style="width:100%" disabled>开始转换</button>
        </div>
        <div class="tool-col">
          <label class="tool-label">文件列表</label>
          <div class="file-list" id="cvList"><div class="tool-hint">尚未选择文件</div></div>
          <div class="tool-hint" id="cvProgress" style="margin-top:10px"></div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    const input = $('cvInput');
    input.addEventListener('change', function () {
      files = Array.from(input.files || []);
      renderList(); $('cvBtn').disabled = files.length === 0;
    });
    $('cvZone').addEventListener('click', function () { input.click(); });
    $('cvZone').addEventListener('dragover', function (e) { e.preventDefault(); });
    $('cvZone').addEventListener('drop', function (e) {
      e.preventDefault();
      files = Array.from(e.dataTransfer.files || []);
      renderList(); $('cvBtn').disabled = files.length === 0;
    });
    $('cvQ').addEventListener('input', function () { $('cvQVal').textContent = this.value; });
    function renderList() {
      const list = $('cvList'); list.innerHTML = '';
      files.forEach(function (f, i) {
        const d = document.createElement('div'); d.className = 'file-item';
        d.innerHTML = `<span>🖼️</span><span class="fname">${f.name}</span><span class="asset-info">${U.formatBytes(f.size)}</span><button class="fremove">✕</button>`;
        d.querySelector('.fremove').addEventListener('click', function () {
          files.splice(i, 1); renderList(); $('cvBtn').disabled = files.length === 0;
        });
        list.appendChild(d);
      });
      if (!files.length) list.innerHTML = '<div class="tool-hint">尚未选择文件</div>';
    }
    $('cvBtn').addEventListener('click', async function () {
      const btn = this; btn.disabled = true; btn.textContent = '转换中…';
      const fmt = $('cvFormat').value, q = parseInt($('cvQ').value, 10) / 100;
      const ext = fmt === 'image/jpeg' ? 'jpg' : fmt.split('/')[1];
      for (let i = 0; i < files.length; i++) {
        $('cvProgress').textContent = `正在转换 ${i + 1} / ${files.length}：${files[i].name}`;
        try {
          const url = URL.createObjectURL(files[i]);
          const img = await U.loadImage(url);
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (fmt === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
          ctx.drawImage(img, 0, 0);
          const blob = await U.canvasToBlob(canvas, fmt, fmt === 'image/png' ? undefined : q);
          U.downloadBlob(blob, files[i].name.replace(/\.[^.]+$/, '') + '.' + ext);
          URL.revokeObjectURL(url);
        } catch (e) { U.toast('转换失败：' + files[i].name); }
      }
      $('cvProgress').textContent = `完成！共转换 ${files.length} 张`;
      U.toast('转换完成，请查看浏览器下载');
      btn.disabled = false; btn.textContent = '开始转换';
    });
  }
});
