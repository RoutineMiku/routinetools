/* PDF 拆分 */
registerTool({
  id: 'pdf-split',
  name: 'PDF 拆分',
  icon: '📑',
  category: 'document',
  desc: '按页码范围提取页面，或将每一页拆成单独 PDF，打包下载。',
  run: function (root) {
    const U = window.ToolUtil;
    let file = null, doc = null, PDFLib = null, pageCount = 0;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="drop-zone" id="psZone">
            <span class="dz-icon">📑</span><span class="dz-title">选择一个 PDF 文件</span>
            <input type="file" id="psInput" accept="application/pdf,.pdf">
          </div>
          <div class="field" style="margin-top:16px"><label>拆分方式</label>
            <select id="psMode" class="tool-input">
              <option value="range">按页码范围（可多段）</option>
              <option value="each">每一页拆成单独文件</option>
            </select>
          </div>
          <div class="field" id="psRangeWrap"><label>页码范围</label>
            <input type="text" id="psRange" class="tool-input" placeholder="例如：1-3,5,8-10">
            <div class="tool-hint">页码从 1 开始，多段用英文逗号分隔</div>
          </div>
          <div class="field"><label>输出文件名前缀</label>
            <input type="text" id="psPrefix" class="tool-input" value="split">
          </div>
          <button class="btn-sm" id="psBtn" style="width:100%" disabled>✂️ 开始拆分</button>
        </div>
        <div class="tool-col">
          <label class="tool-label">文件信息</label>
          <div class="info-note" id="psInfo">尚未选择文件</div>
          <div class="tool-hint" id="psStatus" style="margin-top:12px"></div>
          <div class="info-note" style="margin-top:16px;background:#f8faff;border-left-color:#4f6ef7">
            💡 拆分结果会打包成 ZIP 文件下载，方便一次获取所有页面。
          </div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    U.bindDrop($('psZone'), $('psInput'), async function (f) {
      if (!/\.pdf$/i.test(f.name) && f.type.indexOf('pdf') === -1) { U.toast('请选择 PDF 文件'); return; }
      try {
        file = f; PDFLib = await U.loadPdfLib();
        doc = await PDFLib.PDFDocument.load(await U.readAsArrayBuffer(f));
        pageCount = doc.getPageCount();
        $('psInfo').innerHTML = `文件：<b>${f.name}</b><br>页数：<b>${pageCount}</b><br>大小：<b>${U.formatBytes(f.size)}</b>`;
        $('psRange').placeholder = `例如：1-${Math.min(3, pageCount)},${Math.min(5, pageCount)}`;
        $('psBtn').disabled = false;
      } catch (e) { U.toast('读取 PDF 失败：' + e.message); }
    });
    $('psMode').addEventListener('change', function () {
      $('psRangeWrap').style.display = this.value === 'range' ? 'block' : 'none';
    });
    function parseRanges(str, max) {
      const pages = [];
      str.split(',').forEach(function (part) {
        part = part.trim(); if (!part) return;
        const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
        if (m) { for (let i = parseInt(m[1],10); i <= parseInt(m[2],10); i++) if (i >= 1 && i <= max) pages.push(i - 1); }
        else if (/^\d+$/.test(part)) { const n = parseInt(part,10); if (n >= 1 && n <= max) pages.push(n - 1); }
      });
      return pages.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a,b) { return a-b; });
    }
    $('psBtn').addEventListener('click', async function () {
      if (!doc) return;
      const btn = this; btn.disabled = true; btn.textContent = '拆分中…';
      try {
        const mode = $('psMode').value;
        const groups = [];
        if (mode === 'each') {
          for (let i = 0; i < pageCount; i++) groups.push([i]);
        } else {
          const pages = parseRanges($('psRange').value, pageCount);
          if (!pages.length) { U.toast('请输入有效的页码范围'); btn.disabled = false; btn.textContent = '✂️ 开始拆分'; return; }
          groups.push(pages);
        }
        const JSZip = await U.loadJSZip();
        const zip = new JSZip();
        const prefix = $('psPrefix').value.trim() || 'split';
        for (let g = 0; g < groups.length; g++) {
          $('psStatus').textContent = `正在处理第 ${g+1}/${groups.length} 组…`;
          const nd = await PDFLib.PDFDocument.create();
          const copied = await nd.copyPages(doc, groups[g]);
          copied.forEach(function (p) { nd.addPage(p); });
          const bytes = await nd.save();
          const name = groups.length === 1 ? prefix + '.pdf' : prefix + '-' + (g+1) + '.pdf';
          zip.file(name, bytes);
        }
        $('psStatus').textContent = '正在打包 ZIP…';
        const blob = await zip.generateAsync({ type: 'blob' });
        U.downloadBlob(blob, prefix + '-pages.zip');
        U.toast('拆分完成，已开始下载');
        $('psStatus').textContent = `完成！共生成 ${groups.length} 个 PDF 文件`;
      } catch (e) { U.toast('拆分失败：' + e.message); $('psStatus').textContent = '错误：' + e.message; }
      btn.disabled = false; btn.textContent = '✂️ 开始拆分';
    });
  }
});
