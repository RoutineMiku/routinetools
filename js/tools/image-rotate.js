/* 图片旋转与翻转 */
registerTool({
  id: 'image-rotate',
  name: '图片旋转翻转',
  icon: '🔄',
  category: 'image',
  desc: '图片按 90° 旋转、水平或垂直镜像翻转，适合修正手机照片方向。',
  badge: 'NEW',
  run: function (root) {
    const U = window.ToolUtil;
    let img = null, rotation = 0, flipH = false, flipV = false;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="drop-zone" id="irZone"><span class="dz-icon">🔄</span>
            <span class="dz-title">点击或拖拽图片</span><input type="file" id="irInput" accept="image/*"></div>
          <div class="field" style="margin-top:16px"><label>旋转</label>
            <div class="pill-group" id="irRotate">
              <button class="pill" data-r="-90">↺ 逆时针 90°</button>
              <button class="pill" data-r="90">↻ 顺时针 90°</button>
              <button class="pill" data-r="180">180°</button>
            </div></div>
          <div class="field"><label>翻转</label>
            <div class="pill-group" id="irFlip">
              <button class="pill" data-f="h">水平镜像</button>
              <button class="pill" data-f="v">垂直镜像</button>
            </div></div>
          <div class="field"><label>输出格式</label><select id="irFmt" class="tool-input">
            <option value="image/png">PNG</option><option value="image/jpeg">JPG</option>
            <option value="image/webp">WebP</option></select></div>
          <div class="btn-group"><button class="btn-sm secondary" id="irReset">重置</button>
            <button class="btn-sm" id="irDownload" disabled>⬇️ 下载</button></div>
        </div>
        <div class="tool-col">
          <label class="tool-label">预览</label>
          <div class="preview-box" id="irPreview" style="min-height:300px"><span class="preview-placeholder">上传图片后显示</span></div>
          <div class="tool-hint" id="irInfo" style="margin-top:10px"></div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    U.bindDrop($('irZone'), $('irInput'), function (f) {
      if (!f.type.startsWith('image/')) { U.toast('请选择图片'); return; }
      const url = URL.createObjectURL(f);
      U.loadImage(url).then(function (l) {
        img = l; rotation = 0; flipH = flipV = false;
        $('irReset').click.call(null);
        $('irPreview').innerHTML = '';
        const im = document.createElement('img'); im.src = url; $('irPreview').appendChild(im);
        $('irInfo').textContent = `原始尺寸：${img.naturalWidth} × ${img.naturalHeight}`;
        $('irDownload').disabled = false;
      }).catch(function () { U.toast('图片加载失败'); });
    });
    $('irRotate').addEventListener('click', function (e) {
      const b = e.target.closest('[data-r]'); if (!b || !img) return;
      rotation = (rotation + parseInt(b.dataset.r, 10)) % 360; draw();
    });
    $('irFlip').addEventListener('click', function (e) {
      const b = e.target.closest('[data-f]'); if (!b || !img) return;
      if (b.dataset.f === 'h') flipH = !flipH; else flipV = !flipV;
      draw();
    });
    $('irReset').addEventListener('click', function () {
      rotation = 0; flipH = flipV = false;
      ['irRotate','irFlip'].forEach(function (id) { $(id).querySelectorAll('.pill').forEach(function (p) { p.classList.remove('active'); }); });
      if (img) draw();
    });
    function draw() {
      const canvas = document.createElement('canvas');
      const swap = Math.abs(rotation) === 90 || Math.abs(rotation) === 270;
      canvas.width = swap ? img.naturalHeight : img.naturalWidth;
      canvas.height = swap ? img.naturalWidth : img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate(rotation * Math.PI/180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth/2, -img.naturalHeight/2);
      $('irPreview').innerHTML = '';
      const im = document.createElement('img'); im.src = canvas.toDataURL();
      im.style.maxHeight = '340px'; $('irPreview').appendChild(im);
      $('irInfo').textContent = `输出尺寸：${canvas.width} × ${canvas.height} · 旋转 ${rotation}°`;
      root._irCanvas = canvas;
    }
    $('irDownload').addEventListener('click', function () {
      if (!root._irCanvas) return;
      const fmt = $('irFmt').value;
      root._irCanvas.toBlob(function (blob) {
        U.downloadBlob(blob, 'rotated-' + Date.now() + '.' + fmt.split('/')[1]);
      }, fmt, 0.92);
    });
  }
});
