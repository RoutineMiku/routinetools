/* PDF 页面旋转 */
registerTool({
  id: 'pdf-rotate',
  name: 'PDF 旋转',
  icon: '🔃',
  category: 'document',
  desc: '将 PDF 全部页面或指定页面旋转 90° / 180° / 270°，并导出新文件。',
  run: function (root) {
    const U = window.ToolUtil;
    let doc = null, PDFLib = null, pageCount = 0;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="drop-zone" id="prZone">
            <span class="dz-icon">🔃</span><span class="dz-title">选择一个 PDF 文件</span>
            <input type="file" id="prInput" accept="application/pdf,.pdf">
          </div>
          <div class="field" style="margin-top:16px"><label>旋转角度</label>
            <div class="pill-group" id="prAngles">
              <button class="pill active" data-a="90">90°</button>
              <button class="pill" data-a="180">180°</button>
              <button class="pill" data-a="270">270°</button>
            </div>
          </div>
          <div class="field"><label>应用范围</label>
            <select id="prScope" class="tool-input">
              <option value="all">全部页面</option>
              <option value="range">指定页码</option>
            </select>
          </div>
          <div class="field" id="prRangeWrap" style="display:none"><label>页码</label>
            <input type="text" id="prRange" class="tool-input" placeholder="例如：1,3,5-7">
            <div class="tool-hint">页码从 1 开始</div>
          </div>
          <button class="btn-sm" id="prBtn" style="width:100%" disabled>🔃 应用旋转</button>
        </div>
        <div class="tool-col">
          <label class="tool-label">文件信息</label>
          <div class="info-note" id="prInfo">尚未选择文件</div>
          <div class="tool-hint" id="prStatus" style="margin-top:12px"></div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    let angle = 90;
    $('prAngles').addEventListener('click', function (e) {
      const b = e.target.closest('[data-a]'); if (!b) return;
      this.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); angle = parseInt(b.dataset.a, 10);
    });
    $('prScope').addEventListener('change', function () { $('prRangeWrap').style.display = this.value === 'range' ? 'block' : 'none'; });
    U.bindDrop($('prZone'), $('prInput'), async function (f) {
      try {
        PDFLib = await U.loadPdfLib();
        doc = await PDFLib.PDFDocument.load(await U.readAsArrayBuffer(f));
        pageCount = doc.getPageCount();
        $('prInfo').innerHTML = `文件：<b>${f.name}</b><br>页数：<b>${pageCount}</b><br>大小：<b>${U.formatBytes(f.size)}</b>`;
        $('prBtn').disabled = false;
      } catch (e) { U.toast('读取 PDF 失败：' + e.message); }
    });
    $('prBtn').addEventListener('click', async function () {
      if (!doc) return;
      const btn = this; btn.disabled = true;
      try {
        let targets = [];
        if ($('prScope').value === 'all') {
          targets = doc.getPageIndices();
        } else {
          $('prRange').value.split(',').forEach(function (p) {
            p = p.trim(); const m = p.match(/^(\d+)-(\d+)$/);
            if (m) { for (let i = +m[1]; i <= +m[2]; i++) if (i >= 1 && i <= pageCount) targets.push(i-1); }
            else if (/^\d+$/.test(p) && +p >= 1 && +p <= pageCount) targets.push(+p - 1);
          });
          targets = Array.from(new Set(targets));
        }
        if (!targets.length) { U.toast('没有可旋转的页面'); btn.disabled = false; return; }
        targets.forEach(function (idx) {
          const p = doc.getPage(idx);
          p.setRotation((p.getRotation().asDegrees() + angle) % 360);
        });
        const bytes = await doc.save();
        U.downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'rotated-' + Date.now() + '.pdf');
        $('prStatus').textContent = `完成！已旋转 ${targets.length} 个页面`;
        U.toast('旋转完成');
      } catch (e) { U.toast('旋转失败：' + e.message); }
      btn.disabled = false;
    });
  }
});
