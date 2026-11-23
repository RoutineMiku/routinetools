/* ============================================================
 * 站点配置 —— 你只需要改这个文件即可完成大部分个性化设置
 * 修改后刷新网页即可生效（无需重新编译）
 * ============================================================ */
window.SITE_CONFIG = {
  // 站点基本信息
  siteName: '日常工具箱',
  siteDesc: '把日常用到的工具装进一个箱子 —— 文档处理 / 图片处理 / 网络工具 / 软件下载',
  author: 'RoutineMiku',
  poweredBy: 'RoutineMiku',
  footerNote: '本站点所有工具均在浏览器本地运行，文件不会上传到服务器，请放心使用。',

  // ------------------------------------------------------------
  // 联系我们
  // ------------------------------------------------------------
  contact: {
    wechatQR: 'assets/qr-wechat.jpg',        // 公众号二维码（相对路径）
    wechatTitle: '微信公众号',
    wechatSub: '扫码关注 · 日常MIKU',

    douyinQR: 'assets/douyin-qr.png',        // 抖音二维码
    douyinTitle: '抖音',
    douyinSub: '日常MIKU · RoutineMiku',
    douyinId: 'RoutineMiku',
    douyinLink: 'https://v.douyin.com/0TNzojgzJuU/',  // 抖音主页短链

    // 可选：补充你自己的链接，留空则不显示
    github: 'https://github.com/RoutineMiku',
    gitee: '',
    email: ''
  },

  // ------------------------------------------------------------
  // 软件下载站
  // 每个条目会自动读取对应仓库的 Releases（发行版），并根据
  // 发行版说明自动生成排版、简介、下载按钮和文件体积。
  // platform: 'github' 或 'gitee'
  // ------------------------------------------------------------
  downloadSources: [
    // 示例（把 owner/repo 改成你自己的仓库即可）：
    // { platform: 'github', owner: 'RoutineMiku', repo: 'MaiduReader' },
    // { platform: 'gitee',  owner: 'routinemiku', repo: 'maidu-reader' },
  ],

  // 当 GitHub/Gitee 接口暂时不可用时的兜底展示（可选）
  fallbackDownloads: [
    // { name: '墨读阅读器', desc: '一款简洁的阅读工具', version: 'v1.0.0',
    //   url: 'https://github.com/RoutineMiku/MaiduReader/releases', platform: 'github' }
  ]
};
