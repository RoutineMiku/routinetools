/* 图片与 Base64 互转 */
registerTool({
  id: 'image-base64',
  name: '图片 ↔ Base64',
  icon: '🧬',
  category: 'image',
  desc: '图片转成 Base64 DataURL 便于嵌入代码，或从 Base64 还原为图片下载。',
  badge: 'NEW',
  run: function (root) {
    const U = window.ToolUtil;
    root.innerHTML = `
      <div class="tool-row">
        <div class="tool-col">
          <label class="tool-label">图片 → Base64</label>
          <div class="drop-zone" id="ibZone"><span class="dz-icon">🖼️</span>
            <span class="dz-title">上传图片</span><input type="file" id="ibInput" accept="image/*"></div>
          <div class="field" style="margin-top:12px"><label>DataURL 结果</label>
            <textarea id="ibOut" style="min-height:140px" placeholder="生成的 Base64 会显示在这里"></textarea></div>
          <div class="btn-group"><button class="btn-sm" id="ibCopy" disabled>复制结果</button>
            <button class="btn-sm secondary" id="ibDownloadTxt" disabled>下载 TXT</button></div>
        </div>
        <div class="tool-col">
          <label class="tool-label">Base64 → 图片</label>
          <div class="field"><textarea id="ibIn" style="min-height:140px" placeholder="粘贴 Base64 或 DataURL…"></textarea></div>
          <button class="btn-sm" id="ibRestore">还原为图片</button>
          <div class="preview-box" id="ibPreview" style="min-height:160px;margin-top:12px"><span class="preview-placeholder">还原后显示</span></div>
          <button class="btn-sm secondary" id="ibDownloadImg" style="margin-top:10px" disabled>⬇️ 下载图片</button>
        </div>
      </div>`;
    const $ = function (id) { return root.querySelector('#' + id); };
    let restoredURL = null;
    U.bindDrop($('ibZone'), $('ibInput'), function (f) {
      if (!f.type.startsWith('image/')) { U.toast('请选择图片'); return; }
      const r = new FileReader();
      r.onload = function () {
        $('ibOut').value = r.result;
        $('ibCopy').disabled = false; $('ibDownloadTxt').disabled = false;
        U.toast('转换完成，长度：' + r.result.length);
      };
      r.readAsDataURL(f);
    });
    $('ibCopy').addEventListener('click', function () {
      const el = $('ibOut');
      if (navigator.clipboard) navigator.clipboard.writeText(el.value).then(function () { U.toast('已复制'); });
      else { el.select(); document.execCommand('copy'); U.toast('已复制'); }
    });
    $('ibDownloadTxt').addEventListener('click', function () {
      U.downloadBlob(new Blob([$('ibOut').value], { type: 'text/plain' }), 'base64-' + Date.now() + '.txt');
    });
    $('ibRestore').addEventListener('click', function () {
      let v = $('ibIn').value.trim();
      if (!v) { U.toast('请粘贴 Base64 内容'); return; }
      if (!/^data:image\//.test(v)) v = 'data:image/png;base64,' + v.replace(/\s/g, '');
      U.loadImage(v).then(function () {
        restoredURL = v;
        $('ibPreview').innerHTML = '<img src="' + v + '" alt="还原图片">';
        $('ibDownloadImg').disabled = false;
        U.toast('还原成功');
      }).catch(function () { U.toast('无法解析，请确认是有效的图片 Base64'); });
    });
    $('ibDownloadImg').addEventListener('click', function () {
      if (restoredURL) {
        const ext = restoredURL.match(/^data:image\/(\w+)/);
        U.downloadDataURL(restoredURL, 'restored-' + Date.now() + '.' + (ext ? ext[1] : 'png'));
      }
    });
  }
});
