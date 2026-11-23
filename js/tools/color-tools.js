/* 颜色工具 */
registerTool({
  id: 'color-tools',
  name: '颜色工具',
  icon: '🎨',
  category: 'more',
  desc: 'HEX / RGB / HSL 颜色互转，取色器、随机配色与调色板生成。',
  badge: 'NEW',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col narrow">
          <div class="preview-box" id="ctSwatch" style="min-height:160px;background:#4f6ef7"></div>
          <div class="field" style="margin-top:14px"><label>取色器</label>
            <input type="color" id="ctPicker" value="#4f6ef7" style="width:100%;height:50px;border:1px solid var(--line);border-radius:10px;padding:3px;background:#fff;cursor:pointer"></div>
          <div class="btn-group"><button class="btn-sm secondary" id="ctRandom">🎲 随机颜色</button>
            <button class="btn-sm secondary" id="ctCopy">复制 HEX</button></div>
        </div>
        <div class="tool-col">
          <div class="field"><label>HEX</label><input type="text" id="ctHex" class="tool-input" value="#4F6EF7"></div>
          <div class="field"><label>RGB</label><input type="text" id="ctRgb" class="tool-input" value="79, 110, 247"></div>
          <div class="field"><label>HSL</label><input type="text" id="ctHsl" class="tool-input" value="230, 91%, 64%"></div>
          <label class="tool-label">配色方案</label>
          <div id="ctPalette" style="display:flex;gap:8px;margin-top:10px"></div>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    function hexToRgb(h) {
      h = h.replace('#','');
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    }
    function rgbToHsl(r, g, b) {
      r/=255; g/=255; b/=255;
      const mx = Math.max(r,g,b), mn = Math.min(r,g,b), d = mx-mn;
      let h = 0, s = 0, l = (mx+mn)/2;
      if (d) {
        s = d / (1 - Math.abs(2*l-1));
        if (mx === r) h = ((g-b)/d) % 6; else if (mx === g) h = (b-r)/d + 2; else h = (r-g)/d + 4;
        h *= 60; if (h < 0) h += 360;
      }
      return [Math.round(h), Math.round(s*100), Math.round(l*100)];
    }
    function hslToHex(h, s, l) {
      s/=100; l/=100;
      const c = (1 - Math.abs(2*l-1)) * s, x = c * (1 - Math.abs((h/60)%2-1)), m = l-c/2;
      let r=0,g=0,b=0;
      if (h<60) [r,g,b]=[c,x,0]; else if (h<120) [r,g,b]=[x,c,0]; else if (h<180) [r,g,b]=[0,c,x];
      else if (h<240) [r,g,b]=[0,x,c]; else if (h<300) [r,g,b]=[x,0,c]; else [r,g,b]=[c,0,x];
      return '#' + [r,g,b].map(function (v) { return Math.round((v+m)*255).toString(16).padStart(2,'0'); }).join('').toUpperCase();
    }
    function render(hex, skip) {
      if (!/^#?[0-9a-fA-F]{6}$/.test(hex)) return;
      hex = '#' + hex.replace('#','').toUpperCase();
      const [r,g,b] = hexToRgb(hex), hsl = rgbToHsl(r,g,b);
      $('ctSwatch').style.background = hex;
      $('ctPicker').value = hex.toLowerCase();
      if (skip !== 'hex') $('ctHex').value = hex;
      if (skip !== 'rgb') $('ctRgb').value = r + ', ' + g + ', ' + b;
      if (skip !== 'hsl') $('ctHsl').value = hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%';
      const pal = [hsl[0], (hsl[0]+30)%360, (hsl[0]+180)%360, (hsl[0]+210)%360].map(function (h) {
        return hslToHex(h, hsl[1], hsl[2]);
      });
      $('ctPalette').innerHTML = pal.map(function (c) {
        return `<div title="${c}" style="flex:1;height:54px;border-radius:10px;background:${c};cursor:pointer;border:1px solid var(--line)" data-c="${c}"></div>`;
      }).join('') + `<button class="btn-sm secondary" id="ctAddGray">灰度</button>`;
      $('ctPalette').querySelectorAll('[data-c]').forEach(function (el) {
        el.addEventListener('click', function () { render(this.dataset.c); });
      });
      $('ctAddGray').addEventListener('click', function () {
        const gray = Math.round((r*0.299 + g*0.587 + b*0.114));
        const gh = gray.toString(16).padStart(2,'0');
        render('#' + gh + gh + gh);
      });
    }
    $('ctPicker').addEventListener('input', function () { render(this.value); });
    $('ctHex').addEventListener('input', function () { render(this.value, 'hex'); });
    $('ctRgb').addEventListener('input', function () {
      const p = this.value.split(/[,，\s]+/).filter(Boolean).map(Number);
      if (p.length === 3 && p.every(function (n) { return !isNaN(n) && n >= 0 && n <= 255; })) {
        render('#' + p.map(function (n) { return n.toString(16).padStart(2,'0'); }).join(''), 'rgb');
      }
    });
    $('ctHsl').addEventListener('input', function () {
      const p = this.value.split(/[,，\s%]+/).filter(Boolean).map(Number);
      if (p.length === 3 && !p.some(isNaN)) render(hslToHex(p[0], p[1], p[2]), 'hsl');
    });
    $('ctRandom').addEventListener('click', function () {
      render('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'));
    });
    $('ctCopy').addEventListener('click', function () {
      if (navigator.clipboard) navigator.clipboard.writeText($('ctHex').value).then(function () { U.toast('已复制 HEX'); });
    });
    render('#4F6EF7');
  }
});
