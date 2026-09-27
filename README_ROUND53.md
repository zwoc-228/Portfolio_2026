# Round53 — 基于上传的 Round52

改动：
- 删除笔记本封面的独立凹槽细条，并按封面 UV 定位清除贴图里的对应黑线。未改变建筑模型。
- 删除 Round52 的重复嵌套边框和定位覆盖。Header、侧栏与卡牌共享中性哑光表面、间距与最大 1280px 外框；收起的空白导航卡保持左边缘对齐，悬浮展开。
- 地面改为有限尺寸，后方加入真实曲面过渡到竖直背景。摄影机降低俯视角，并根据三模型边界调整取景距离，防止窄屏裁切。
- 保留已有烘焙模型、金属回形针、交互、地面倒影和事件驱动渲染。没有引入实时光线追踪或额外离屏渲染。

部署：将 DEPLOY ZIP 解压后全部内容放到静态站点根目录。请使用 HTTP 服务打开，勿直接双击 index.html。无须构建、无须 npm install。
本地启动示例：python3 -m http.server 8080

CODE 包包含可编辑运行代码和检查脚本。运行：node tools/check.mjs
封面纹理修复过程：node tools/export-cover.mjs，然后 python3 tools/repair-cover.py（需要 NumPy、Pillow、SciPy）。

验证范围：JS 语法、全部保留模型的 UV 长度、凹槽移除、背景接缝/法线、7 种宽度的 Header 对齐、5 种视口的模型投影边界、资源依赖、ZIP CRC。
未完成：浏览器 WebGL 视觉验收、交互实测和设备 FPS 测量。不能把静态检查等同于最终视觉验收。

参考：
- 用户提供的拟态 UI 截图、实体产品摄影和背景纸参考图。
- https://towardsdatascience.com/neumorphism-with-animation-1c24a4c0e2b4/ （正文访问被 robots 阻止，未声称读过正文）
- CMU School of Architecture, How to Photograph Your Model:
  https://www.andrew.cmu.edu/course/48-105/resources/Photo%20Instructions.pdf
  借鉴背景纸置于模型后方及下方、柔光和侧向布光的原则。
