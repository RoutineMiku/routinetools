/* 图片转 PDF */
registerTool({
  id: 'images-to-pdf',
  name: '图片转 PDF',
  icon: '🖼️➡️📄',
  category: 'document',
  desc: '多张图片按选择顺序合成一个 PDF，可选原图尺寸或 A4 排版。',
  run: function (root) {
    const U = window.ToolUtil;
    let files = [];
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="drop-zone" id="i2pZone">
            <span class="dz-icon">🖼️</span><span class="dz-title">选择多张图片</span>
            <input type="file" id="i2pInput" accept="image/*" multiple>
          </div>
          <div class="field" style="margin-top:16px"><label>页面尺寸</label>
            <select id="i2pSize" class="tool-input">
              <option value="image">跟随图片尺寸（推荐）</option>
              <option value="a4">A4 纸（每页一张，居中）</option>
            </select>
          </div>
          <div class="field"><label>图片质量：<span id="i2pQVal">85</span>%</label>
            <input type="range" id="i2pQ" min="30" max="100" value="85"></div>
          <button class="btn-sm" id="i2pBtn" style="width:100%" disabled>📄 生成 PDF</button>
        </div>
        <div class="tool-col">
          <label class="tool-label">图片顺序（可用箭头调整）</label>
          <div class="file-list" id="i2pList"><div class="tool-hint">尚未选择图片</div></div>
          <div class="tool-hint" id="i2pStatus" style="margin-top:10px"></div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    const input = $('i2pInput');
    input.addEventListener('change', function () { files = files.concat(Array.from(input.files || [])); render(); input.value = ''; });
    $('i2pZone').addEventListener('click', function () { input.click(); });
    $('i2pZone').addEventListener('dragover', function (e) { e.preventDefault(); });
    $('i2pZone').addEventListener('drop', function (e) { e.preventDefault(); files = files.concat(Array.from(e.dataTransfer.files || [])); render(); });
    $('i2pQ').addEventListener('input', function () { $('i2pQVal').textContent = this.value; });
    function render() {
      const list = $('i2pList'); list.innerHTML = '';
      files.forEach(function (f, i) {
        const d = document.createElement('div'); d.className = 'file-item';
        d.innerHTML = `<span>🖼️</span><span class="fname">${i+1}. ${f.name}</span><span class="asset-info">${U.formatBytes(f.size)}</span>
          <span class="fupdown"><button data-a="up">▲</button><button data-a="down">▼</button></span><button class="fremove">✕</button>`;
        d.querySelector('[data-a="up"]').onclick = function () { if (i > 0) { [files[i-1],files[i]]=[files[i],files[i-1]]; render(); } };
        d.querySelector('[data-a="down"]').onclick = function () { if (i < files.length-1) { [files[i+1],files[i]]=[files[i],files[i+1]]; render(); } };
        d.querySelector('.fremove').onclick = function () { files.splice(i,1); render(); };
        list.appendChild(d);
      });
      if (!files.length) list.innerHTML = '<div class="tool-hint">尚未选择图片</div>';
      $('i2pBtn').disabled = files.length === 0;
    }
    $('i2pBtn').addEventListener('click', async function () {
      const btn = this; btn.disabled = true; btn.textContent = '生成中…';
      try {
        $('i2pStatus').textContent = '加载 PDF 组件…';
        const PDFLib = await U.loadPdfLib();
        const pdf = await PDFLib.PDFDocument.create();
        const sizeMode = $('i2pSize').value;
        const q = parseInt($('i2pQ').value, 10) / 100;
        for (let i = 0; i < files.length; i++) {
          $('i2pStatus').textContent = `处理中 ${i+1}/${files.length}：${files[i].name}`;
          const url = URL.createObjectURL(files[i]);
          const img = await U.loadImage(url);
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.drawImage(img, 0, 0);
          const jpgBytes = await U.canvasToBlob(canvas, 'image/jpeg', q);
          const jpgArray = new Uint8Array(await jpgBytes.arrayBuffer());
          const embedded = await pdf.embedJpg(jpgArray);
          let page;
          if (sizeMode === 'image') {
            page = pdf.addPage([embedded.width, embedded.height]);
            page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
          } else {
            const pw = 595.28, ph = 841.89;
            page = pdf.addPage([pw, ph]);
            const scale = Math.min((pw - 40) / embedded.width, (ph - 40) / embedded.height, 1);
            const w = embedded.width * scale, h = embedded.height * scale;
            page.drawImage(embedded, { x: (pw - w)/2, y: (ph - h)/2, width: w, height: h });
          }
          URL.revokeObjectURL(url);
        }
        $('i2pStatus').textContent = '正在保存…';
        const bytes = await pdf.save();
        U.downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'images-' + Date.now() + '.pdf');
        U.toast('PDF 生成完成');
        $('i2pStatus').textContent = `完成！共 ${files.length} 页`;
      } catch (e) { U.toast('生成失败：' + e.message); $('i2pStatus').textContent = '错误：' + e.message; }
      btn.disabled = false; btn.textContent = '📄 生成 PDF';
    });
  }
});
