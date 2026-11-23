/* WebADB：浏览器通过 WebUSB 连接安卓设备 */
registerTool({
  id: 'webadb',
  name: 'WebADB 设备连接',
  icon: '🤖',
  category: 'network',
  desc: '通过 WebUSB 在浏览器中识别安卓设备，并提供完整 WebADB 在线工具入口。',
  badge: '实验性',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="info-note">
        WebADB 让浏览器通过 <b>WebUSB</b> 直接连接安卓手机（无需安装 adb）。使用前请：
        ① 使用 Chrome / Edge 等 Chromium 浏览器；② 确保本站通过 HTTPS 访问；
        ③ 手机开启「开发者选项 → USB 调试」；④ 用数据线连接电脑。
      </div>
      <div class="feature-grid">
        <div class="feature-item"><div class="fi-icon">🔌</div><b>USB 设备识别</b>在浏览器里查看已连接的 USB 设备信息</div>
        <div class="feature-item"><div class="fi-icon">📱</div><b>完整 ADB</b>文件管理 / Shell / 截图 / 装 APK 等功能</div>
        <div class="feature-item"><div class="fi-icon">🔒</div><b>安全提示</b>网页需你手动授权才会获得设备访问权</div>
      </div>
      <div class="tool-row">
        <div class="tool-col">
          <label class="tool-label">本机 USB 设备检测</label>
          <div class="btn-group" style="margin-top:0">
            <button class="btn-sm" id="adbList">列出已授权设备</button>
            <button class="btn-sm secondary" id="adbPick">选择设备并授权</button>
          </div>
          <div class="preview-box" id="adbDevices" style="min-height:120px;margin-top:12px;display:block;padding:14px;font-family:ui-monospace,Consolas,monospace;font-size:12px">
            <span class="preview-placeholder">点击上方按钮检测设备</span>
          </div>
        </div>
        <div class="tool-col">
          <label class="tool-label">打开完整 WebADB 工具</label>
          <p class="tool-hint" style="margin:8px 0 14px">
            完整版 ADB 功能（交互式 Shell、文件管理、屏幕镜像、安装 APK 等）由开源项目 ya-webadb 提供，
            点击按钮在新标签页打开官方在线工具。
          </p>
          <a class="btn-sm" href="https://yume-chan.github.io/ya-webadb/" target="_blank" rel="noopener" style="display:inline-block">🚀 打开 WebADB 在线工具</a>
          <p class="tool-hint" style="margin-top:12px">
            开源地址：<a href="https://github.com/yume-chan/ya-webadb" target="_blank" rel="noopener" style="color:var(--primary)">github.com/yume-chan/ya-webadb</a>
          </p>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    function show(devices) {
      const box = $('adbDevices'); box.innerHTML = '';
      if (!devices.length) { box.innerHTML = '<span class="preview-placeholder">未检测到已授权设备，请点击「选择设备并授权」</span>'; return; }
      devices.forEach(function (d) {
        const line = document.createElement('div');
        line.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--line)';
        line.innerHTML = `🤖 <b>${d.productName || '未知设备'}</b> · VendorID: 0x${d.vendorId.toString(16)} · ProductID: 0x${d.productId.toString(16)}${d.serialNumber ? ' · SN: ' + d.serialNumber : ''}`;
        box.appendChild(line);
      });
    }
    if (!navigator.usb) {
      $('adbDevices').innerHTML = '<span class="preview-placeholder" style="color:#e33">当前浏览器不支持 WebUSB，请使用 Chrome / Edge 并通过 HTTPS 访问本站</span>';
      $('adbList').disabled = true; $('adbPick').disabled = true;
      return;
    }
    $('adbList').addEventListener('click', async function () {
      try { show(await navigator.usb.getDevices()); }
      catch (e) { U.toast('检测失败：' + e.message); }
    });
    $('adbPick').addEventListener('click', async function () {
      try {
        const d = await navigator.usb.requestDevice({ filters: [] });
        show([d]); U.toast('设备已授权');
      } catch (e) {
        if (e.name !== 'NotFoundError') U.toast('选择失败：' + e.message);
      }
    });
  }
});
