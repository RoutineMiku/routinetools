/* Web SSH 终端（连接你自己的 WebSocket/websockify 网关） */
registerTool({
  id: 'ssh',
  name: 'Web SSH 终端',
  icon: '💻',
  category: 'network',
  desc: '在浏览器中使用 SSH 终端，通过你自己的 WebSocket 网关连接服务器。',
  badge: '高级',
  run: function (root) {
    const U = window.ToolUtil;
    let term = null, ws = null;
    root.innerHTML = `
      <div class="info-note warn-note">
        浏览器不能直接发起 SSH 连接，需要一个 <b>WebSocket → SSH 网关</b>（如 websockify / ssh-web 等）。
        本工具只负责终端显示与收发，请填入你自己搭建或信任的网关地址。请勿在不可信的网关输入密码。
      </div>
      <div class="term-toolbar" style="margin-top:16px">
        <input type="text" id="sshUrl" class="tool-input" style="flex:1;min-width:220px" placeholder="wss://your-host:6080/websockify 或 ws://localhost:6080">
        <button class="btn-sm" id="sshConnect">连接</button>
        <button class="btn-sm danger" id="sshDisconnect" disabled>断开</button>
        <span class="tool-hint" id="sshStatus" style="margin:0">未连接</span>
      </div>
      <div class="terminal-box" id="sshTerm"></div>
      <div class="tool-hint" style="margin-top:10px">
        💡 提示：本地网关可用 websockify 把 SSH 的 22 端口转成 WebSocket；网关需要支持二进制帧。页面关闭即断开连接。
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    const status = $('sshStatus');
    function setStatus(t, color) { status.textContent = t; status.style.color = color || 'var(--ink-3)'; }

    async function connect() {
      const url = $('sshUrl').value.trim();
      if (!/^wss?:\/\//i.test(url)) { U.toast('请输入 ws:// 或 wss:// 开头的地址'); return; }
      try {
        await U.loadScript('https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/lib/xterm.min.js');
        if (!window.Terminal) throw new Error('终端组件加载失败');
      } catch (e) { U.toast(e.message); return; }
      if (ws) { try { ws.close(); } catch (e) {} }
      $('sshTerm').innerHTML = '';
      term = new window.Terminal({
        cursorBlink: true, fontSize: 14, fontFamily: 'Consolas, Menlo, monospace',
        theme: { background: '#0d1117', foreground: '#c9d1d9', cursor: '#58a6ff' },
        cols: Math.max(40, Math.floor($('sshTerm').clientWidth / 8.5)),
        rows: 22, allowTransparency: false, scrollback: 2000
      });
      term.open($('sshTerm'));
      term.writeln('\x1b[36m正在连接 ' + url + ' …\x1b[0m');
      try {
        ws = new WebSocket(url);
        ws.binaryType = 'arraybuffer';
        ws.onopen = function () {
          setStatus('已连接', '#16a34a');
          $('sshDisconnect').disabled = false; $('sshConnect').disabled = true;
          term.writeln('\x1b[32m✔ 已连接到网关\x1b[0m');
          term.focus();
        };
        ws.onmessage = function (e) {
          let text = '';
          if (typeof e.data === 'string') text = e.data;
          else text = new TextDecoder().decode(e.data);
          term.write(text);
        };
        ws.onerror = function () { setStatus('连接错误', '#e33'); term.writeln('\x1b[31m✘ 连接错误，请检查网关地址\x1b[0m'); };
        ws.onclose = function () {
          setStatus('已断开', 'var(--ink-3)');
          $('sshDisconnect').disabled = true; $('sshConnect').disabled = false;
          term.writeln('\r\n\x1b[33m连接已关闭\x1b[0m');
        };
        term.onData(function (data) { if (ws && ws.readyState === WebSocket.OPEN) ws.send(data); });
      } catch (e) { setStatus('连接失败', '#e33'); U.toast('连接失败：' + e.message); }
    }
    $('sshConnect').addEventListener('click', connect);
    $('sshDisconnect').addEventListener('click', function () {
      if (ws) { ws.close(); ws = null; }
      setStatus('已断开');
    });
  }
});
