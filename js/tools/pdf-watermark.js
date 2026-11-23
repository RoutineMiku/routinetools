/* PDF 加水印 */
registerTool({
  id: 'pdf-watermark',
  name: 'PDF 加水印',
  icon: '💧',
  category: 'document',
  desc: '给 PDF 每页添加文字水印，可调整内容、透明度、角度和字号。',
  badge: 'NEW',
  run: function (root) {
    const U = window.ToolUtil;
    let file = null;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="drop-zone" id="pwZone"><span class="dz-icon">📄</span>
            <span class="dz-title">选择 PDF 文件</span><input type="file" id="pwInput" accept="application/pdf,.pdf"></div>
          <div class="field" style="margin-top:16px"><label>水印文字</label>
            <input type="text" id="pwText" class="tool-input" value="RoutineMiku"></div>
          <div class="field"><label>字体大小：<span id="pwSizeVal">48</span></label>
            <input type="range" id="pwSize" min="12" max="120" value="48"></div>
          <div class="field"><label>透明度：<span id="pwOpacityVal">15</span>%</label>
            <input type="range" id="pwOpacity" min="3" max="80" value="15"></div>
          <div class="field"><label>旋转角度：<span id="pwAngleVal">-45</span>°</label>
            <input type="range" id="pwAngle" min="-90" max="90" value="-45"></div>
          <div class="field"><label>颜色</label><input type="color" id="pwColor" value="#888888"></div>
          <button class="btn-sm" id="pwBtn" style="width:100%" disabled>💧 添加水印</button>
        </div>
        <div class="tool-col">
          <label class="tool-label">说明</label>
          <div class="info-note" id="pwInfo" style="line-height:1.9">
            尚未选择文件。<br><br>
            水印将平铺添加到 PDF 的每一页，全部处理在浏览器本地完成，文件不会上传。
          </div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    ['pwSize','pwOpacity','pwAngle'].forEach(function (id, i) {
      $(id).addEventListener('input', function () {
        $(['pwSizeVal','pwOpacityVal','pwAngleVal'][i]).textContent = this.value;
      });
    });
    U.bindDrop($('pwZone'), $('pwInput'), function (f) {
      if (!/\.pdf$/i.test(f.name) && f.type.indexOf('pdf') === -1) { U.toast('请选择 PDF 文件'); return; }
      file = f; $('pwBtn').disabled = false;
      $('pwInfo').innerHTML = `文件：<b>${f.name}</b><br>大小：<b>${U.formatBytes(f.size)}</b><br><br>点击左侧「添加水印」开始处理。`;
    });
    $('pwBtn').addEventListener('click', async function () {
      if (!file) return;
      const btn = this; btn.disabled = true; btn.textContent = '处理中…';
      try {
        const PDFLib = await U.loadPdfLib();
        const src = await PDFLib.PDFDocument.load(await U.readAsArrayBuffer(file));
        const pdf = await PDFLib.PDFDocument.create();
        const pages = await pdf.copyPages(src, src.getPageIndices());
        pages.forEach(function (p) { pdf.addPage(p); });
        const text = $('pwText').value || 'RoutineMiku';
        const fontSize = parseInt($('pwSize').value, 10);
        const opacity = parseInt($('pwOpacity').value, 10) / 100;
        const angle = parseInt($('pwAngle').value, 10);
        const color = $('pwColor').value;
        const font = await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
        pdf.getPages().forEach(function (page) {
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          page.drawText(text, {
            x: (width - textWidth) / 2, y: height / 2,
            size: fontSize, font: font, opacity: opacity,
            color: PDFLib.rgb(parseInt(color.slice(1,3),16)/255, parseInt(color.slice(3,5),16)/255, parseInt(color.slice(5,7),16)/255),
            rotate: PDFLib.degrees(angle)
          });
        });
        const bytes = await pdf.save();
        U.downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'watermarked-' + Date.now() + '.pdf');
        U.toast('水印添加完成');
      } catch (e) { U.toast('处理失败：' + e.message); }
      btn.disabled = false; btn.textContent = '💧 添加水印';
    });
  }
});
