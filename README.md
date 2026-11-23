# 🧰 日常工具箱（RoutineMiku Toolbox）

一个纯静态的 Web 工具站：**文档处理 / 图片处理 / 网络工具 / 软件下载站**，所有工具都在浏览器本地运行，不需要服务器。直接把整个文件夹推到 GitHub / Gitee 仓库，开启 Pages 即可通过仓库网页地址访问。

---

## 一、本地预览

在项目根目录启动任意静态服务器（不要用 `file://` 直接打开，部分 API 受限）：

```bash
python -m http.server 8080
```

然后访问 <http://localhost:8080>。

---

## 二、部署到 GitHub Pages / Gitee Pages

1. 把整个文件夹内容推送到仓库根目录（或 `docs/` 目录）。
2. **GitHub**：仓库 → Settings → Pages → Source 选择 `main` 分支 / root → 保存。
   访问地址形如 `https://你的用户名.github.io/仓库名/`。
3. **Gitee**：仓库 → 服务 → Gitee Pages → 选择分支和目录 → 启动。
   访问地址形如 `https://你的用户名.gitee.io/仓库名/`。

> 站点全部使用相对路径，放在仓库子目录下也能正常工作。

---

## 三、日常维护（只改 `config.js`）

所有站点级设置都集中在根目录 `config.js`，改完刷新网页即可生效：

- `siteName` / `siteDesc`：站名和首屏描述
- `contact`：公众号二维码、抖音二维码、抖音链接、GitHub 等
  - 换二维码：把新图片放进 `assets/` 目录，然后修改对应的 `wechatQR` / `douyinQR` 路径
- `downloadSources`：**软件下载站的数据源**，见下节
- `fallbackDownloads`：接口不可用时的兜底内容

---

## 四、软件下载站如何自动工作

在 `config.js` 的 `downloadSources` 里添加你的仓库：

```js
downloadSources: [
  { platform: 'github', owner: 'RoutineMiku', repo: 'MaiduReader' },
  { platform: 'gitee',  owner: 'routinemiku', repo: 'maidu-reader' }
]
```

页面会自动读取该仓库的 **Releases（发行版）**，并把每个发行版渲染成一张下载卡片：

- 标题、版本号（tag）、发布日期
- 发行版说明（支持 Markdown：标题、列表、链接、代码块等）
- 每个附件显示文件名、大小、下载次数和下载按钮

**发布新软件的方法**：在对应仓库创建一个 Release，上传安装包附件并写好说明，工具箱的下载站会自动更新（刷新页面即可）。无需改动本站代码。

> 注意：仓库需要是公开仓库。GitHub 未登录 API 有限额（每小时 60 次），对静态站来说完全够用。

---

## 五、如何新增一个工具（3 步）

1. 在 `js/tools/` 新建一个 JS 文件，例如 `my-tool.js`：

```js
registerTool({
  id: 'my-tool',              // 唯一英文 id
  name: '我的工具',            // 卡片标题
  icon: '🛠️',                 // 图标 emoji
  category: 'image',          // image / document / network / more
  desc: '一句话介绍这个工具',
  badge: 'NEW',               // 可选角标
  run: function (container) { // container 是弹窗内容容器
    container.innerHTML = '<p>在这里写你的工具界面和逻辑</p>';
  }
});
```

2. 在 `js/tools.js` 的 `TOOL_SCRIPTS` 数组里加上 `'js/tools/my-tool.js'`。
3. 如果新分类，在 `TOOL_CATEGORIES` 里加一项即可。

刷新页面，工具卡片就会自动出现在对应分类下。工具内部可直接用公共样式（`css/tools.css`）和辅助函数 `ToolUtil`（下载、读文件、图片处理等）。

---

## 六、已内置工具

| 分类 | 工具 |
| --- | --- |
| 图片处理 | 图片压缩、一寸照片制作、格式转换、图片裁剪、图片加水印、二维码生成、二维码解码、图片旋转翻转、图片 ↔ Base64 |
| 文档处理 | JSON 转文件、PDF 合并、PDF 拆分、PDF 旋转、图片转 PDF、文本处理、Markdown 预览、PDF 加水印 |
| 网络工具 | Base64 编解码、URL 编解码、Hash 计算、正则测试器、密码生成器、时间戳转换、WebADB 设备连接、Web SSH 终端 |
| 更多工具 | 单位换算、颜色工具 |

PDF 功能使用 pdf-lib 在浏览器本地完成，无需上传文件；WebADB 与 SSH 为高级工具，分别依赖 WebUSB 与你自己的 WebSocket 网关，弹窗内已有说明。

---

## 七、目录结构

```
routine-toolbox/
├── index.html          # 页面结构
├── config.js           # ⭐ 你要经常改的配置文件
├── assets/             # 二维码等图片
├── css/
│   ├── style.css       # 站点整体样式
│   └── tools.css       # 工具内部通用样式
├── js/
│   ├── app.js          # 主程序：渲染 / 弹窗 / 下载站
│   ├── tools.js        # ⭐ 工具注册表（新增工具时改这里）
│   └── tools/          # 每个工具一个文件
└── README.md
```

---

Powered by **RoutineMiku** · 抖音号：RoutineMiku
