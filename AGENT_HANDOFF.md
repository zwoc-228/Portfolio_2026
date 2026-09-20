# Latest round: 2026-09-20 Round 22

See `UPDATE_2026-09-20_ROUND22_MATERIAL_SWAP.md` first, then Round 21. Round 22 swaps the architecture surface system to the user-uploaded Marble021 / Metal044A / Plastic013A packs while reducing the runtime texture budget. Round 21 contains the architecture scale, research anti-moire rebuild, unified glass UI, transition performance changes, brighter metal environment, and emissive window details.

# 接手说明 / deployment handoff

## 运行与部署
- Node.js 18+，项目根目录运行 `npm run dev`，访问 http://localhost:4173 。无需 npm install，无构建步骤。
- 部署目录是 `dist/`：将其中的内容上传到任意支持 JavaScript/GLB/字体文件的静态 HTTP(S) 托管。不要通过 file:// 打开。
- 所有运行依赖、贴图、字体均在包内；不依赖 CDN、API key 或后端。
- 此便携包不包含原 Sites 的身份配置、Git 凭据或历史。新托管平台需自行配置站点。
- `MANIFEST.sha256` 可核对包内文件。`node scripts/validate-assets.mjs` 验证几何与 GLB 容器，`node scripts/export-models.mjs` 重新导出模型。

## 当前修改
- 回形针轮廓缩至原来的 67%，线径由 .009 降至 .0065，保留纸面接触高度。
- 用左侧大柔光板、顶部弱光板及右侧暗反射板替换通用 RoomEnvironment；减少环境补光，增强主光与暗部差异。
- 增强亚麻 sheen，调整透明体吸收距离、铜/钢粗糙度及金属桌面的柔和实体反射。
- 保持已有构图、物件位置、字体和过渡时序；本轮没有完成运镜重构。
- Fluent 官方参考：https://fluent2.microsoft.design/material 。借鉴材质分层与半透明表面思路；这份 UI 指南不是物理渲染参数标准。截图仍是构图与配色的最终依据。

## 入口与资产
- `dist/app.js`：状态、相机、灯光、材质加载和交互。
- `dist/models.js`：可编辑程序化几何与 PBR 材质定义；不是 Blender 源文件。
- `dist/studio-environment.js`：反射环境光板；`dist/floor-reflection.js`：实时平面反射。
- `dist/scene-layout.js`：已拟合 HOME 变换。调整外形时必须重新检查投影。
- `dist/models/*.glb`：独立三个模型及组合，可导入 Blender。不存在 .blend 文件。
- GLB 不含浏览器桌面、灯光和反射着色器；导出材质与浏览器并非逐项等价（浏览器粗糙度贴图与 bump 等需重新接线；sheen 已导出）。
- `dist/references/current-home.png` 为最新 HOME 基准。`specs/` 有五份规格；旧规格若与此图冲突，以最新图和用户指令为准。

## 必须明确的未完成项
当前环境浏览器 WebGL 被禁用，曾返回 GL_RENDERER=Disabled，无法完成真实 GPU 首页截图和像素比对。通过的是语法、几何及打包检查，不代表视觉质量已达标；本轮新的反射环境同样未经过 GPU 视觉验收。

接手优先级：
1. 在支持 WebGL2 的浏览器以 1672×941 与 1536×864、DPR 1 截取真实 HOME；对齐参考后再调曝光与反射强度。检查透明体层叠、纸面接触阴影、回形针尺寸、反射 shader 编译及高光是否过曝。
2. 逐项修复书脊/页边曲面、石材与亚麻细节。用户明确拒绝粗模、占位盒子与用参考截图冒充真实渲染。
3. 完成七状态 Playwright 比对：HOME；三类 preview；三类 index。等待字体、贴图、data-scene-ready=true 后拍摄。保留实际截图、overlay 与差异指标，不以低差异数字代替审美验收。
4. 静态效果通过后才处理动画与运镜的僵硬感；静态截图不能推断真实时序。当前为基础 smoothstep 过渡，相机没有完整电影化调度。
5. 索引图和标题来自参考样张，项目正文、真实联系信息及精确字体未提供。当前内容不应误称为完整正式作品集。

打包时间：2026-09-20。此包是可部署、可编辑的接手版本，不是已通过视觉验收的终稿。

## 2026-09-20 细节更新
- 32 层独立书页细边，微小错位和弯曲；书脊鼓起形变；头尾装订线。
- 织物 sheenColor 从默认黑色改为暖白，增加经纬交织微结构；石材使用细颗粒和针孔；铜、钢增加独立粗糙度贴图。
- 每个透明实体独立 thickness；高透射物件不再投不透明实心阴影（仍没有真实透射阴影或焦散）。
- 回形针按上层纸的曲率贴合，保留微小弹性弓起。
- 贴图再生成顺序：refine-materials.py → surface-detail.py；需要 numpy、Pillow、scipy。
- GLB 导出现在保留 sheen；微表面 roughness 贴图仍以网页版本为准。
- 本轮仍未完成真实 WebGL 截图验收，构图与运镜保持原版。

## 桌面亮度修正
桌面银色由 #b8bfc2 改为 #d5dade，并单独绑定反射环境、envMapIntensity=1.15；物件环境强度 .65 与全局曝光保持不变。保留拉丝、实体反射和接触阴影。实际 GPU 视觉验收仍待完成。

## Round 23 full UI refactor
The current working version is the reference-led Round 23 UI refactor. Read `ROUND23_UI_REFACTOR_AUDIT.md` for the component-by-component audit and `UI_REFERENCE_LINKS.md` for every external reference/tool link used in this pass.

UI code is now split into `dist/styles/*`, `dist/glass-ui.js`, `dist/ui-view.js`, and `dist/content-data.js`; `dist/app.js` remains the Three.js scene/orchestration layer. Architecture emissive windows are removed, while the existing scene spotlight / volumetric interaction remains.
