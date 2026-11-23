/* PDF 合并 */
registerTool({
  id: 'pdf-merge',
  name: 'PDF 合并',
  icon: '📚',
  category: 'document',
  desc: '将多个 PDF 文件按顺序合并为一个文件，可调整顺序、移除文件。',
  run: function (root) {
    const U = window.ToolUtil;
    let files = [];
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="drop-zone" id="pmZone">
            <span class="dz-icon">📚</span><span class="dz-title">选择多个 PDF 文件</span>
            <span class="dz-sub">文件或拖拽进来，可多次添加</span>
            <input type="file" id="pmInput" accept="application/pdf,.pdf" multiple>
          </div>
          <div class="tool-hint" style="margin-top:10px">合并顺序与下方列表一致，可用箭头调整。</div>
        </div>
        <div class="tool-col">
          <label class="tool-label">待合并文件</label>
          <div class="file-list" id="pmList"><div class="tool-hint">尚未选择文件</div></div>
          <div class="btn-group">
            <button class="btn-sm" id="pmBtn" disabled>🔗 开始合并</button>
          </div>
          <div class="tool-hint" id="pmStatus" style="margin-top:10px"></div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    const input = $('pmInput');
    function addFiles(list) {
      list.forEach(function (f) {
        if (f.type.indexOf('pdf') === -1 && !/\.pdf$/i.test(f.name)) { U.toast('跳过非 PDF 文件：' + f.name); return; }
        files.push(f);
      });
      render();
    }
    input.addEventListener('change', function () { addFiles(Array.from(input.files || [])); input.value = ''; });
    $('pmZone').addEventListener('click', function () { input.click(); });
    $('pmZone').addEventListener('dragover', function (e) { e.preventDefault(); });
    $('pmZone').addEventListener('drop', function (e) { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files || [])); });
    function render() {
      const list = $('pmList'); list.innerHTML = '';
      files.forEach(function (f, i) {
        const d = document.createElement('div'); d.className = 'file-item';
        d.innerHTML = `<span>📄</span><span class="fname">${i + 1}. ${f.name}</span>
          <span class="asset-info">${U.formatBytes(f.size)}</span>
          <span class="fupdown"><button data-a="up">▲</button><button data-a="down">▼</button></span>
          <button class="fremove">✕</button>`;
        d.querySelector('[data-a="up"]').onclick = function () { if (i > 0) { [files[i-1], files[i]] = [files[i], files[i-1]]; render(); } };
        d.querySelector('[data-a="down"]').onclick = function () { if (i < files.length - 1) { [files[i+1], files[i]] = [files[i], files[i+1]]; render(); } };
        d.querySelector('.fremove').onclick = function () { files.splice(i, 1); render(); };
        list.appendChild(d);
      });
      if (!files.length) list.innerHTML = '<div class="tool-hint">尚未选择文件</div>';
      $('pmBtn').disabled = files.length < 2;
    }
    $('pmBtn').addEventListener('click', async function () {
      const btn = this; btn.disabled = true; btn.textContent = '合并中…';
      try {
        $('pmStatus').textContent = '正在加载 PDF 组件…';
        const PDFLib = await U.loadPdfLib();
        const merged = await PDFLib.PDFDocument.create();
        for (let i = 0; i < files.length; i++) {
          $('pmStatus').textContent = `正在处理 ${i + 1}/${files.length}：${files[i].name}`;
          const bytes = await U.readAsArrayBuffer(files[i]);
          const doc = await PDFLib.PDFDocument.load(bytes);
          const pages = await merged.copyPages(doc, doc.getPageIndices());
          pages.forEach(function (p) { merged.addPage(p); });
        }
        $('pmStatus').textContent = '正在生成文件…';
        const out = await merged.save();
        U.downloadBlob(new Blob([out], { type: 'application/pdf' }), 'merged-' + Date.now() + '.pdf');
        U.toast('合并完成');
        $('pmStatus').textContent = `完成！共合并 ${files.length} 个文件，总页数 ${merged.getPageCount()}`;
      } catch (e) {
        U.toast('合并失败：' + e.message);
        $('pmStatus').textContent = '错误：' + e.message;
      }
      btn.disabled = false; btn.textContent = '🔗 开始合并';
    });
  }
});
