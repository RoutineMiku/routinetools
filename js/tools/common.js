/* 工具通用辅助函数（所有工具脚本都会先加载它） */
window.ToolUtil = (function () {
  function formatBytes(n) {
    if (n == null || isNaN(n)) return '-';
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1024 / 1024).toFixed(2) + ' MB';
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
  }
  function downloadDataURL(dataURL, filename) {
    const a = document.createElement('a');
    a.href = dataURL; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
  }
  function readAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      const r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
  function readAsArrayBuffer(file) {
    return new Promise(function (resolve, reject) {
      const r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = reject;
      r.readAsArrayBuffer(file);
    });
  }
  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }
  function canvasToBlob(canvas, type, quality) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) { resolve(blob); }, type, quality);
    });
  }
  function toast(msg) { if (window.showToast) window.showToast(msg); else alert(msg); }
  // 按需加载外部脚本
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const exist = document.querySelector('script[data-src="' + src + '"]');
      if (exist && exist.dataset.loaded === '1') return resolve();
      const s = document.createElement('script');
      s.src = src; s.dataset.src = src;
      s.onload = function () { s.dataset.loaded = '1'; resolve(); };
      s.onerror = function () { reject(new Error('脚本加载失败: ' + src)); };
      document.head.appendChild(s);
    });
  }
  // 按需加载 JSZip（打包多个文件下载）
  function loadJSZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    return loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')
      .then(function () { return window.JSZip; });
  }
  // 按需加载 pdf-lib
  function loadPdfLib() {
    if (window.PDFLib) return Promise.resolve(window.PDFLib);
    return loadScript('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js')
      .catch(function () { return loadScript('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js'); })
      .then(function () { if (!window.PDFLib) throw new Error('PDF 组件加载失败，请检查网络'); return window.PDFLib; });
  }
  // 给拖拽区绑定事件
  function bindDrop(zone, input, callback) {
    zone.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () { if (input.files && input.files[0]) callback(input.files[0]); });
    ['dragenter', 'dragover'].forEach(function (e) {
      zone.addEventListener(e, function (ev) { ev.preventDefault(); zone.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (e) {
      zone.addEventListener(e, function (ev) { ev.preventDefault(); zone.classList.remove('dragover'); });
    });
    zone.addEventListener('drop', function (ev) {
      const f = ev.dataTransfer.files && ev.dataTransfer.files[0];
      if (f) callback(f);
    });
  }
  return {
    formatBytes: formatBytes, downloadBlob: downloadBlob, downloadDataURL: downloadDataURL,
    readAsDataURL: readAsDataURL, readAsArrayBuffer: readAsArrayBuffer, loadImage: loadImage,
    canvasToBlob: canvasToBlob, toast: toast, bindDrop: bindDrop, loadScript: loadScript, loadPdfLib: loadPdfLib, loadJSZip: loadJSZip
  };
})();
