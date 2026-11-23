/* ============================================================
 * 日常工具箱 —— 主程序
 * 负责：加载工具脚本、渲染页面、弹窗、下载站、联系区
 * ============================================================ */
(function () {
  'use strict';
  const CFG = window.SITE_CONFIG;
  const $ = function (s, el) { return (el || document).querySelector(s); };
  const $$ = function (s, el) { return Array.from((el || document).querySelectorAll(s)); };

  /* ---------- 轻提示 ---------- */
  let toastTimer = null;
  window.showToast = function (msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  };

  /* ---------- 工具脚本加载 ---------- */
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { console.warn('工具脚本加载失败：' + src); resolve(); };
      document.head.appendChild(s);
    });
  }
  async function loadAllTools() {
    for (const src of (window.TOOL_SCRIPTS || [])) await loadScript(src);
  }

  /* ---------- 头部信息 ---------- */
  function initHeader() {
    document.title = CFG.siteName + ' · Powered by ' + CFG.poweredBy;
    $('#heroDesc').textContent = CFG.siteDesc;
    $('#footerNote').textContent = CFG.footerNote || '';
    $('.powered').innerHTML = 'Powered by <strong>' + CFG.poweredBy + '</strong> · 抖音号：' +
      (CFG.contact.douyinId || 'RoutineMiku');
    $('.footer-brand').textContent = '🧰 ' + CFG.siteName;
    $('.brand-text').textContent = CFG.siteName;

    const toggle = $('#navToggle'), nav = $('#mainNav');
    toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
    $$('.nav-link').forEach(function (a) {
      a.addEventListener('click', function () {
        $$('.nav-link').forEach(function (x) { x.classList.remove('active'); });
        a.classList.add('active'); nav.classList.remove('open');
      });
    });
    window.addEventListener('scroll', function () {
      $('#siteHeader').style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(31,39,64,.07)' : '';
    });
  }

  /* ---------- 工具箱渲染 ---------- */
  const colorMap = {
    image: ['#ff7a59', 'rgba(255,122,89,.10)'],
    document: ['#4f6ef7', 'rgba(79,110,247,.10)'],
    network: ['#22c3c6', 'rgba(34,195,198,.10)'],
    more: ['#8b5cf6', 'rgba(139,92,246,.10)']
  };
  let activeCat = 'all';

  function initTools() {
    const cats = window.TOOL_CATEGORIES || [];
    const tools = window.TOOL_REGISTRY || [];
    $('#statTools').textContent = tools.length;
    $('#statCats').textContent = cats.length;

    const tabs = $('#categoryTabs');
    tabs.innerHTML = '<button class="tab active" data-c="all">全部工具</button>' +
      cats.map(function (c) { return `<button class="tab" data-c="${c.id}">${c.icon} ${c.name}</button>`; }).join('');
    tabs.addEventListener('click', function (e) {
      const b = e.target.closest('[data-c]'); if (!b) return;
      $$('.tab', tabs).forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active'); activeCat = b.dataset.c; renderTools();
    });
    $('#toolSearch').addEventListener('input', renderTools);
    renderTools();
  }

  function renderTools() {
    const kw = $('#toolSearch').value.trim().toLowerCase();
    const cats = window.TOOL_CATEGORIES || [];
    const tools = window.TOOL_REGISTRY || [];
    const box = $('#toolCategories'); box.innerHTML = '';
    let total = 0;
    cats.forEach(function (cat) {
      if (activeCat !== 'all' && activeCat !== cat.id) return;
      const list = tools.filter(function (t) {
        if (t.category !== cat.id) return false;
        if (!kw) return true;
        return (t.name + t.desc + (t.icon || '')).toLowerCase().indexOf(kw) !== -1;
      });
      if (!list.length) return;
      total += list.length;
      const colors = colorMap[cat.id] || colorMap.more;
      const sec = document.createElement('div'); sec.className = 'cat-block';
      sec.innerHTML = `<div class="cat-head"><span class="cat-icon">${cat.icon}</span>
          <span class="cat-name">${cat.name}</span><span class="cat-desc">${cat.desc}</span></div>
        <div class="tool-grid">${list.map(function (t) {
          return `<div class="tool-card" data-id="${t.id}" style="--tcolor:${colors[0]};--tbg:${colors[1]}">
            <div class="tool-card-top"><div class="tool-icon">${t.icon || '🛠️'}</div>
              <div class="tool-name">${t.name}</div>
              ${t.badge ? `<span class="tool-badge">${t.badge}</span>` : ''}</div>
            <div class="tool-desc">${t.desc || ''}</div>
            <span class="tool-go">立即使用 <span>→</span></span>
          </div>`;
        }).join('')}</div>`;
      box.appendChild(sec);
    });
    $('#toolEmpty').hidden = total > 0;
    $$('.tool-card', box).forEach(function (card) {
      card.addEventListener('click', function () { openTool(card.dataset.id); });
    });
  }

  /* ---------- 工具弹窗 ---------- */
  function openTool(id) {
    const tool = (window.TOOL_REGISTRY || []).find(function (t) { return t.id === id; });
    if (!tool) return;
    $('#modalIcon').textContent = tool.icon || '🛠️';
    $('#modalTitle').textContent = tool.name;
    $('#modalDesc').textContent = tool.desc || '';
    const body = $('#modalBody'); body.innerHTML = '';
    try { tool.run(body); }
    catch (e) { body.innerHTML = '<div class="info-note" style="border-left-color:#e33">工具加载失败：' + e.message + '</div>'; }
    const modal = $('#toolModal'); modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeTool() {
    $('#toolModal').hidden = true;
    $('#modalBody').innerHTML = '';
    document.body.style.overflow = '';
  }
  function initModal() {
    $$('[data-close]').forEach(function (el) { el.addEventListener('click', closeTool); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#toolModal').hidden) closeTool(); });
  }

  /* ---------- 联系我们 ---------- */
  function initContact() {
    const c = CFG.contact || {}, box = $('#contactGrid');
    let html = '';
    if (c.wechatQR) {
      html += `<div class="contact-card"><div class="qr-frame"><img src="${c.wechatQR}" alt="微信公众号二维码"></div>
        <div class="contact-title">${c.wechatTitle || '微信公众号'}</div>
        <div class="contact-sub">${c.wechatSub || '扫码关注'}</div></div>`;
    }
    if (c.douyinQR) {
      html += `<div class="contact-card"><div class="qr-frame is-douyin"><img src="${c.douyinQR}" alt="抖音二维码"></div>
        <div class="contact-title">${c.douyinTitle || '抖音'}</div>
        <div class="contact-sub">${c.douyinSub || ''}</div>
        ${c.douyinLink ? `<a class="contact-link" href="${c.douyinLink}" target="_blank" rel="noopener">打开抖音主页 →</a>` : ''}</div>`;
    }
    const links = [];
    if (c.github) links.push(['GitHub', c.github, '🐙']);
    if (c.gitee) links.push(['Gitee', c.gitee, '🥝']);
    if (c.email) links.push(['邮箱', 'mailto:' + c.email, '✉️']);
    if (links.length) {
      html += `<div class="contact-card"><div class="qr-frame" style="font-size:64px;display:grid;place-items:center">👋</div>
        <div class="contact-title">更多方式</div>
        <div class="contact-sub">欢迎交流与合作</div>
        <div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        ${links.map(function (l) { return `<a class="btn-sm secondary" href="${l[1]}" target="_blank" rel="noopener">${l[2]} ${l[0]}</a>`; }).join('')}</div></div>`;
    }
    box.innerHTML = html || '<div class="info-note">暂无联系方式，请在 config.js 中配置。</div>';
  }

  /* ---------- 极简 Markdown 渲染（用于发行版说明） ---------- */
  function mdToHtml(md) {
    if (!md) return '';
    const blocks = [];
    md = md.replace(/```([\w-]*)\n?([\s\S]*?)```/g, function (_, lang, code) {
      blocks.push('<pre style="background:#f1f3f9;padding:12px;border-radius:8px;overflow:auto;font-size:12px"><code>' + esc(code.trim()) + '</code></pre>');
      return '\n@@BLOCK' + (blocks.length - 1) + '@@\n';
    });
    function esc(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
    function inline(s) {
      s = esc(s);
      s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%">');
      s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
      s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
      s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>');
      return s;
    }
    const lines = md.split('\n');
    let out = '', inUl = false;
    lines.forEach(function (line) {
      const bm = line.match(/@@BLOCK(\d+)@@/);
      if (bm) { if (inUl) { out += '</ul>'; inUl = false; } out += blocks[+bm[1]]; return; }
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) { if (inUl) { out += '</ul>'; inUl = false; } out += '<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>'; return; }
      const li = line.match(/^\s*[-*+]\s+(.*)$/);
      if (li) { if (!inUl) { out += '<ul>'; inUl = true; } out += '<li>' + inline(li[1]) + '</li>'; return; }
      const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
      if (ol) { if (!inUl) { out += '<ul>'; inUl = true; } out += '<li>' + inline(ol[1]) + '</li>'; return; }
      if (!line.trim()) { if (inUl) { out += '</ul>'; inUl = false; } return; }
      out += '<p>' + inline(line) + '</p>';
    });
    if (inUl) out += '</ul>';
    return out;
  }

  function fmtSize(n) {
    if (!n && n !== 0) return '';
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n/1024).toFixed(1) + ' KB';
    return (n/1048576).toFixed(1) + ' MB';
  }
  function fmtDate(s) {
    if (!s) return '';
    const d = new Date(s);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('zh-CN');
  }
  function fileIcon(name) {
    if (/\.exe$/i.test(name)) return '🪟';
    if (/\.(apk|ipa)$/i.test(name)) return '📱';
    if (/\.(dmg|pkg)$/i.test(name)) return '🍎';
    if (/\.(zip|rar|7z|tar|gz)$/i.test(name)) return '📦';
    if (/\.msi$/i.test(name)) return '💿';
    return '📄';
  }

  /* ---------- 下载站 ---------- */
  async function initDownloads() {
    const box = $('#downloadList'), badge = $('#syncBadge');
    const sources = CFG.downloadSources || [];
    const cards = [];
    if (!sources.length) {
      const fb = CFG.fallbackDownloads || [];
      if (fb.length) {
        cards.push.apply(cards, fb.map(function (a) {
          return { name: a.name, version: a.version || '', date: '', desc: '<p>' + (a.desc || '') + '</p>',
            platform: a.platform || 'github', assets: a.url ? [{ name: '前往下载', url: a.url, size: '', downloads: '' }] : [] };
        }));
      }
    }
    for (const src of sources) {
      try {
        let releases = [];
        if (src.platform === 'gitee') {
          const url = `https://gitee.com/api/v5/repos/${src.owner}/${src.repo}/releases?per_page=5`;
          const res = await fetch(url); if (!res.ok) throw new Error('HTTP ' + res.status);
          releases = await res.json();
        } else {
          const url = `https://api.github.com/repos/${src.owner}/${src.repo}/releases?per_page=5`;
          const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          releases = await res.json();
        }
        if (!Array.isArray(releases)) throw new Error('接口返回格式异常');
        releases.forEach(function (r) {
          cards.push({
            name: r.name || src.repo,
            version: r.tag_name || '',
            date: fmtDate(r.published_at || r.created_at),
            desc: mdToHtml(r.body || r.description || '暂无发行版说明'),
            platform: src.platform || 'github',
            assets: (r.assets || []).map(function (a) {
              return { name: a.name, url: a.browser_download_url, size: fmtSize(a.size), downloads: a.download_count };
            })
          });
        });
      } catch (e) {
        cards.push({ name: src.repo, version: '', date: '', platform: src.platform,
          desc: '<p style="color:#e33">发行版读取失败：' + escText(e.message) + '。请检查仓库地址是否为公开仓库，或在网络恢复后刷新。</p>', assets: [] });
      }
    }
    function escText(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

    if (!cards.length) {
      box.innerHTML = `<div class="loading-card" style="text-align:left;line-height:1.9">
        <b style="font-size:16px;color:var(--ink)">📭 下载站还没有配置软件</b><br>
        在仓库的 <code>config.js</code> 里的 <code>downloadSources</code> 添加你的仓库即可自动同步发行版，例如：<br>
        <code>{ platform: 'github', owner: '你的用户名', repo: '你的仓库名' }</code><br>
        添加后，每个 Releases 发行版的标题、说明和附件会自动生成为上方这样的下载卡片。
      </div>`;
      badge.textContent = '等待配置';
      return;
    }
    box.innerHTML = cards.map(function (a) {
      const isGitee = a.platform === 'gitee';
      return `<div class="app-card">
        <div class="app-head"><div class="app-logo">📦</div><div>
          <div class="app-name">${escText(a.name)}</div>
          <div class="app-meta"><span class="tag ${isGitee ? 'gitee' : ''}">${isGitee ? 'Gitee' : 'GitHub'}</span>
          ${a.version ? `<span class="tag">${escText(a.version)}</span>` : ''}${a.date ? `<span>📅 ${a.date}</span>` : ''}</div>
        </div></div>
        <div class="app-desc">${a.desc}</div>
        ${a.assets.length ? `<div class="assets">${a.assets.map(function (f) {
          return `<div class="asset"><span class="asset-icon">${fileIcon(f.name)}</span>
            <span class="asset-name">${escText(f.name)}</span>
            <span class="asset-info">${f.size}${f.downloads !== '' && f.downloads != null ? ' · ↓' + f.downloads : ''}</span>
            <a class="asset-btn" href="${f.url}" target="_blank" rel="noopener">下载</a></div>`;
        }).join('')}</div>` : ''}
      </div>`;
    }).join('');
    badge.textContent = '已同步 ' + cards.length + ' 个发行版';
  }

  /* ---------- 启动 ---------- */
  async function boot() {
    initHeader();
    initContact();
    initModal();
    await loadAllTools();
    initTools();
    initDownloads();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
