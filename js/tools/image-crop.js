/* 图片裁剪（可拖拽选区 + 比例锁定） */
registerTool({
  id: 'image-crop',
  name: '图片裁剪',
  icon: '✂️',
  category: 'image',
  desc: '拖动选区自由裁剪，支持 1:1、4:3、16:9 等常用比例。',
  run: function (root) {
    const U = window.ToolUtil;
    let img = null, sel = { x: 0, y: 0, w: 0, h: 0 }, resultBlob = null;
    const ratios = { '自由': 0, '1:1': 1, '4:3': 4/3, '3:4': 3/4, '16:9': 16/9, '9:16': 9/16 };

    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="tool-section">
            <label class="tool-label">1. 选择图片</label>
            <div class="drop-zone" id="crZone">
              <span class="dz-icon">✂️</span><span class="dz-title">点击或拖拽图片</span>
              <input type="file" id="crInput" accept="image/*">
            </div>
          </div>
          <div class="tool-section">
            <label class="tool-label">2. 裁剪比例</label>
            <div class="pill-group" id="crRatios">
              ${Object.keys(ratios).map((k,i)=>`<button class="pill ${i===0?'active':''}" data-r="${ratios[k]}">${k}</button>`).join('')}
            </div>
          </div>
          <div class="tool-hint">在右侧图片上拖动选区，拖动四角可调整大小。</div>
          <div class="btn-group">
            <button class="btn-sm" id="crBtn" disabled>裁剪</button>
            <button class="btn-sm secondary" id="crReset" disabled>重置选区</button>
          </div>
        </div>
        <div class="tool-col">
          <label class="tool-label">裁剪区域</label>
          <div class="preview-box" id="crStage" style="display:block;min-height:280px;position:relative;overflow:hidden">
            <span class="preview-placeholder" id="crPlaceholder">上传图片后在此裁剪</span>
            <div id="crCanvasWrap" style="display:none;position:relative;display:inline-block"></div>
          </div>
          <div class="tool-hint" id="crSize" style="margin-top:8px"></div>
          <div class="result-bar" id="crResult" hidden>
            <div>裁剪后尺寸：<b id="crDim">-</b></div>
            <button class="btn-sm" id="crDownload">⬇️ 下载</button>
          </div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    let ratio = 0, overlay = null, handles = [], start = null, mode = null;

    U.bindDrop($('crZone'), $('crInput'), function (f) {
      if (!f.type.startsWith('image/')) { U.toast('请选择图片'); return; }
      const url = URL.createObjectURL(f);
      U.loadImage(url).then(function (loaded) {
        img = loaded;
        $('crPlaceholder').hidden = true;
        const wrap = $('crCanvasWrap'); wrap.style.display = 'inline-block'; wrap.innerHTML = '';
        const im = document.createElement('img'); im.src = url;
        im.style.cssText = 'display:block;max-width:100%;max-height:360px';
        wrap.appendChild(im);
        overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;border:2px solid #4f6ef7;box-shadow:0 0 0 9999px rgba(20,26,44,.45);cursor:move;box-sizing:border-box';
        wrap.appendChild(overlay);
        ['nw','ne','sw','se'].forEach(function (pos) {
          const h = document.createElement('div');
          h.dataset.pos = pos;
          h.style.cssText = 'position:absolute;width:12px;height:12px;background:#fff;border:2px solid #4f6ef7;border-radius:3px;box-sizing:border-box;' +
            (pos.includes('n') ? 'top:-7px;' : 'bottom:-7px;') + (pos.includes('w') ? 'left:-7px;cursor:nwse-resize' : 'right:-7px;cursor:nesw-resize');
          overlay.appendChild(h); handles.push(h);
        });
        im.onload = function () { resetSel(); };
        if (im.complete) resetSel();
        $('crBtn').disabled = false; $('crReset').disabled = false;
        bindDrag();
      }).catch(function () { U.toast('图片加载失败'); });
    });

    function wrapSize() {
      const im = $('crCanvasWrap').querySelector('img');
      return { w: im.clientWidth, h: im.clientHeight };
    }
    function resetSel() {
      const s = wrapSize();
      let w = Math.round(s.w * 0.8), h = Math.round(s.h * 0.8);
      if (ratio) { h = Math.round(w / ratio); if (h > s.h) { h = s.h; w = Math.round(h * ratio); } }
      sel = { x: Math.round((s.w - w) / 2), y: Math.round((s.h - h) / 2), w: w, h: h };
      applySel();
    }
    function applySel() {
      if (!overlay) return;
      overlay.style.left = sel.x + 'px'; overlay.style.top = sel.y + 'px';
      overlay.style.width = sel.w + 'px'; overlay.style.height = sel.h + 'px';
      const s = wrapSize();
      const sx = img.naturalWidth / s.w, sy = img.naturalHeight / s.h;
      $('crSize').textContent = `原始：${img.naturalWidth}×${img.naturalHeight}px · 选区：${Math.round(sel.w*sx)}×${Math.round(sel.h*sy)}px`;
    }
    function bindDrag() {
      overlay.addEventListener('pointerdown', function (e) {
        const h = e.target.dataset.pos;
        mode = h ? 'resize:' + h : 'move';
        start = { px: e.clientX, py: e.clientY, x: sel.x, y: sel.y, w: sel.w, h: sel.h };
        overlay.setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation();
      });
      overlay.addEventListener('pointermove', function (e) {
        if (!start) return;
        const dx = e.clientX - start.px, dy = e.clientY - start.py;
        const s = wrapSize();
        if (mode === 'move') {
          sel.x = clamp(start.x + dx, 0, s.w - sel.w);
          sel.y = clamp(start.y + dy, 0, s.h - sel.h);
        } else {
          const pos = mode.split(':')[1];
          let x = start.x, y = start.y, w = start.w, h = start.h;
          if (pos.includes('e')) w = clamp(start.w + dx, 40, s.w - start.x);
          if (pos.includes('s')) h = clamp(start.h + dy, 40, s.h - start.y);
          if (pos.includes('w')) { const nx = clamp(start.x + dx, 0, start.x + start.w - 40); w = start.w + (start.x - nx); x = nx; }
          if (pos.includes('n')) { const ny = clamp(start.y + dy, 0, start.y + start.h - 40); h = start.h + (start.y - ny); y = ny; }
          if (ratio) {
            if (w / h > ratio) w = h * ratio; else h = w / ratio;
            if (pos.includes('w')) x = start.x + start.w - w;
            if (pos.includes('n')) y = start.y + start.h - h;
          }
          sel = { x: x, y: y, w: w, h: h };
        }
        applySel();
      });
      ['pointerup','pointercancel'].forEach(function (ev) {
        overlay.addEventListener(ev, function () { start = null; mode = null; });
      });
    }
    function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

    $('crRatios').addEventListener('click', function (e) {
      const b = e.target.closest('[data-r]'); if (!b) return;
      this.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); ratio = parseFloat(b.dataset.r);
      if (img) resetSel();
    });
    $('crReset').addEventListener('click', function () { if (img) resetSel(); });
    $('crBtn').addEventListener('click', function () {
      if (!img) return;
      const s = wrapSize();
      const sx = img.naturalWidth / s.w, sy = img.naturalHeight / s.h;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(sel.w * sx); canvas.height = Math.round(sel.h * sy);
      canvas.getContext('2d').drawImage(img, sel.x * sx, sel.y * sy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      resultBlob = null;
      canvas.toBlob(function (b) { resultBlob = b; }, 'image/png');
      $('crDim').textContent = canvas.width + '×' + canvas.height + 'px';
      $('crResult').hidden = false;
      const pv = document.createElement('img'); pv.src = canvas.toDataURL();
      pv.style.maxHeight = '200px';
      const old = $('crResult').querySelector('img'); if (old) old.remove();
      $('crResult').appendChild(pv);
    });
    $('crDownload').addEventListener('click', function () {
      if (resultBlob) U.downloadBlob(resultBlob, 'crop-' + Date.now() + '.png');
    });
  }
});
