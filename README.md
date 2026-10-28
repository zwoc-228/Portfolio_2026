# Portfolio 2026 · Round57

基于上传的 round56_CODE_v6。根目录是唯一源码；dist 由构建生成，禁止手动修改。

## 使用
- npm run dev：重建 dist 并启动 http://localhost:4173。
- npm run check：模型/UV/相机/布局/帧调度检查，构建并审计运行依赖。
- npm run build：生成 dist；直接静态部署使用 DEPLOY 包。
- 无需安装依赖，Node 18+。保留现有 GitHub Pages 发布流程。

## 修改
- 统一 12px 圆角、24px 间距、中性哑光面板；减轻凸起阴影和嵌套边框。
- 加强标题层级，统一卡片图片、正文留白、年份和箭头位置。
- 首页分类使用直立衬线标题与克制的悬停线条反馈；空白 header 不添加文字或 logo。
- 建筑材质减少亮釉反射；昼夜灯光保留，但减轻黄/蓝偏色。
- header 与内容共用左边界，折叠时关闭时间浮层，并同步移除隐藏链接焦点。
- WebGL 不可用时提供真实项目缩略图索引；导航、分类和详情仍可用。
- 保留模型几何、地面反射、接触阴影、光束和粒子、单帧驱动与静止休眠。

## 验证及限制
npm run check 通过。浏览器已验证降级首页、分类、列表、详情打开/关闭和 header 展开。
浏览器环境禁用了 WebGL，因此尚未完成 3D 光影视觉验收、真机帧率及移动设备浏览器验收。
现有缩略图只有约 65–97px，放大仍会模糊；本轮未生成虚构作品图或宣称提高原图清晰度。

## 设计参考
- https://lusion.co/projects/ ：空间呈现与界面层级。
- https://plateforme10-interactive-map.vercel.app/ ：模型优先的轻量导航。
- https://dokle.design/awards/leo-parpeix-3d-world-per-portfolio-page ：2026 年工作室场景作品集案例。
参考仅作为方向研究，没有复制第三方代码或资产。
