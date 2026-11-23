/* 单位换算 */
registerTool({
  id: 'unit-converter',
  name: '单位换算',
  icon: '📐',
  category: 'more',
  desc: '长度、重量、温度、面积、体积、时间、数据、速度、压力等常用单位换算。',
  badge: 'NEW',
  run: function (root) {
    const U = window.ToolUtil;
    const groups = {
      '长度': { '米':1, '千米':1000, '厘米':0.01, '毫米':0.001, '英里':1609.344, '码':0.9144, '英尺':0.3048, '英寸':0.0254, '海里':1852 },
      '重量': { '千克':1, '克':0.001, '吨':1000, '磅':0.45359237, '盎司':0.0283495, '斤':0.5, '两':0.05 },
      '温度': { '摄氏度':'c', '华氏度':'f', '开尔文':'k' },
      '面积': { '平方米':1, '平方千米':1000000, '平方厘米':0.0001, '公顷':10000, '亩':666.6667, '平方英尺':0.092903, '平方英里':2589988 },
      '体积': { '升':1, '毫升':0.001, '立方米':1000, '立方厘米':0.001, '加仑(美)':3.785412, '品脱(英)':0.568261 },
      '时间': { '秒':1, '分钟':60, '小时':3600, '天':86400, '周':604800, '月(30天)':2592000, '年(365天)':31536000 },
      '数据': { '字节':1, 'KB':1024, 'MB':1048576, 'GB':1073741824, 'TB':1099511627776, 'bit':0.125 },
      '速度': { '米/秒':1, '千米/时':0.277778, '英里/时':0.44704, '节':0.514444, '英尺/秒':0.3048 },
      '压力': { '帕':1, '千帕':1000, '兆帕':1000000, 'bar':100000, 'atm':101325, 'mmHg':133.322, 'psi':6894.757 }
    };
    root.innerHTML = `
      <div class="field"><label>换算类型</label><div class="pill-group" id="ucGroups">
        ${Object.keys(groups).map(function (k, i) { return `<button class="pill ${i===0?'active':''}" data-g="${k}">${k}</button>`; }).join('')}
      </div></div>
      <div class="tool-row">
        <div class="tool-col">
          <div class="field"><label>从</label><input type="number" id="ucFromVal" class="tool-input" value="1">
            <select id="ucFrom" class="tool-input" style="margin-top:8px"></select></div>
        </div>
        <div class="tool-col" style="max-width:60px;display:grid;place-items:center">
          <button class="btn-sm secondary" id="ucSwap" title="交换">⇄</button>
        </div>
        <div class="tool-col">
          <div class="field"><label>到</label><input type="number" id="ucToVal" class="tool-input" readonly>
            <select id="ucTo" class="tool-input" style="margin-top:8px"></select></div>
        </div>
      </div>
      <div class="info-note" id="ucFormula" style="margin-top:14px"></div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    let group = '长度';
    function fill() {
      const units = Object.keys(groups[group]);
      $('ucFrom').innerHTML = units.map(function (u) { return `<option>${u}</option>`; }).join('');
      $('ucTo').innerHTML = units.map(function (u) { return `<option>${u}</option>`; }).join('');
      if (units[1]) $('ucTo').selectedIndex = 1;
      calc();
    }
    function convertTemp(v, from, to) {
      let c;
      if (from === '摄氏度') c = v;
      else if (from === '华氏度') c = (v - 32) * 5/9;
      else c = v - 273.15;
      if (to === '摄氏度') return c;
      if (to === '华氏度') return c * 9/5 + 32;
      return c + 273.15;
    }
    function calc() {
      const v = parseFloat($('ucFromVal').value);
      if (isNaN(v)) { $('ucToVal').value = ''; return; }
      const f = $('ucFrom').value, t = $('ucTo').value;
      let r;
      if (group === '温度') r = convertTemp(v, f, t);
      else r = v * groups[group][f] / groups[group][t];
      $('ucToVal').value = Number.isInteger(r) ? r : parseFloat(r.toPrecision(10));
      $('ucFormula').innerHTML = `${v} ${f} = <b>${$('ucToVal').value} ${t}</b>`;
    }
    $('ucGroups').addEventListener('click', function (e) {
      const b = e.target.closest('[data-g]'); if (!b) return;
      this.querySelectorAll('.pill').forEach(x => x.classList.remove('active')); b.classList.add('active');
      group = b.dataset.g; fill();
    });
    ['ucFromVal','ucFrom','ucTo'].forEach(function (id) { $(id).addEventListener('input', calc); $(id).addEventListener('change', calc); });
    $('ucSwap').addEventListener('click', function () {
      const a = $('ucFrom').value; $('ucFrom').value = $('ucTo').value; $('ucTo').value = a;
      const v = $('ucToVal').value; $('ucFromVal').value = v; calc();
    });
    fill();
  }
});
