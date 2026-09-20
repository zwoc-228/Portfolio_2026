# GitHub 接手包 — 2026-09-20

这是现有作品集的完整源码与部署文件，包含最近的桌面提亮修改。不是仅供观看的图片，也不是只有编译结果。

## 本地打开
安装 Node.js 18 或更新版本，在解压后的项目根目录运行：

```sh
npm run dev
```

然后打开 http://localhost:4173 。无需安装 npm 依赖。不能双击 HTML 以 file:// 打开。

## 放入 GitHub
新建空仓库，将解压后的全部内容作为仓库根目录提交，保留 `.github/` 文件夹。建议使用 Git 或 GitHub Desktop 导入完整文件夹，避免网页上传遗漏隐藏文件。不要把 ZIP 本身当作网站源码上传。

若从命令行开始，在此项目根目录依次运行（替换仓库地址）：

```sh
git init
git add .
git commit -m "Import portfolio handoff"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

## 部署
- 通用静态托管：发布目录 `dist`，无需构建命令。所有资源用相对路径。
- GitHub Pages：仓库 Settings → Pages → Source 选 GitHub Actions。已附 `.github/workflows/pages.yml`；推送到 main 或在 Actions 手动运行即可。
- 工作流尚未在你的 GitHub 仓库执行；Pages 可用性和访问权限以该仓库设置为准。无需填写原网站的凭据。

## 交给其他 AI
先把 `AI_NEXT_PROMPT.md` 的全文粘贴给它，再让它读取 `AGENT_HANDOFF.md`、`specs/`、源码与 `dist/references/`。

## 当前真实性边界
模型、纹理、网页和交互代码都在包内。没有 Blender .blend 源文件；GLB 可以导入 Blender。当前网页实时调用 `dist/models.js` 生成几何，修改 GLB 文件不会自动改变网页。若改用 Blender 工作流，需要明确实现 GLB 加载并保持节点与交互映射。

现有部署环境不能运行 WebGL，最后几轮只有数据与代码检查，未完成真实 GPU 截图验收。模型质感、光影、动画均仍有优化空间。参考素材的使用权需由使用者确认；包内字体许可随资产保留，项目未擅自附加开源许可证。

主要目录：
- `dist/`：可直接部署的网页，也包含实际可编辑的 JS/CSS 源码。
- `scripts/`：模型导出、纹理生成、几何检查、本地服务器。
- `specs/`：五份视觉、场景、交互、资产与 QA 规格。
- `qa/`：历史检查记录，不表示当前视觉已通过。
- `MANIFEST.sha256`：交付文件校验值。

包内排除了旧 ZIP、Git 历史、原 Sites 身份配置和访问凭据。

GitHub Pages 配置依据：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
