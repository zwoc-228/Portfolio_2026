你现在接手 Yuanlong Zhu 的 WebGL 个人作品集。请直接检查并继续实际项目工作，不要重新生成一套普通作品集模板。

先读 START_HERE.md、AGENT_HANDOFF.md、specs/ 的五份规格、qa/QA_REPORT.md，再查看 dist/references/current-home.png 和七状态参考图，最后检查 app.js、models.js、scene-layout.js、studio-environment.js、floor-reflection.js、style.css。

目标：以参考图为视觉依据，将三件真实物件（亚麻笔记本、建筑材质模型、论文纸叠）放在浅银色拉丝金属桌面上。质量目标是克制、真实、细腻的定制 WebGL 作品。Fluent / 新拟物仅用于理解表面与照明，不授权改成彩色玩具、玻璃 UI 或增加发光特效。

明确要求：
1. 优先完成 HOME 构图、比例、字体、模型、材质与光影。静态效果稳定后再处理动画和运镜。保持已有三栏目和七状态结构。
2. 最新反馈是桌面过暗；当前已单独提高桌面的银色与环境反射，尚未得到用户视觉确认。不要未经比较就改回暗灰桌面。
3. 书脊、布面、纸边和回形针要有可信的小形变；石材、亚麻、纸、铜、钢和亚克力应有不同的物理反应。保持回形针目前缩小后的量级，不再无故放大。
4. 不用占位盒子充当完成模型，不用背景渐变代替金属，不用参考图或生成图冒充网站截图，不靠提高全局曝光掩盖材质问题。
5. 网页当前从 models.js 实时生成网格，dist/models/*.glb 是导出资产。若修改 Blender/GLB，必须同步网页加载路径；不要只改无实际使用的模型文件。
6. 先在可运行 WebGL2 的浏览器启动项目，截取真实 HOME。记录 GPU、浏览器、分辨率与控制台错误。上一位 agent 无法运行 WebGL，不能继承“视觉已验收”的假设。
7. HOME 以 1672×941 和 1536×864、DPR 1 检查；与对应参考做并排、半透明叠加及局部对比。检查物件投影边界、标签、桌面亮度、透明体厚度、书页接触和高光过曝。参考图不是可替换的截图基线。
8. 三类 preview/index 也要真实截图。状态 URL：#home；#writing/preview、#architecture/preview、#research/preview；以及各自 /index。等待字体、贴图、过渡稳定。测试点击物件、标签、Enter、Back、Escape、浏览器历史和快速反向切换。
9. 动画目前只是基础 smoothstep；相机没有完整的转场编排。不得从静态截图声称推断了原作精确动画。先给出与参考一致的克制运动实现，再提供实际运行证据。
10. 当前精确字体、真实项目全文和联系信息未提供；不要捏造用户作品。旧规格/历史 QA 与当前代码可能有出入，逐项核对；最新参考与用户指令优先。

执行方式：尽量复用现有项目，不做无关重构。遇到不支持 GPU 的运行环境，明确报告并保留待验收项，不能用空白画面宣称成功。每轮简洁说明具体改了什么、实际测了什么和未解决什么；交付可运行源码与更新后的交接文档。

## Round 23 full UI refactor
The current working version is the reference-led Round 23 UI refactor. Read `ROUND23_UI_REFACTOR_AUDIT.md` for the component-by-component audit and `UI_REFERENCE_LINKS.md` for every external reference/tool link used in this pass.

UI code is now split into `dist/styles/*`, `dist/glass-ui.js`, `dist/ui-view.js`, and `dist/content-data.js`; `dist/app.js` remains the Three.js scene/orchestration layer. Architecture emissive windows are removed, while the existing scene spotlight / volumetric interaction remains.
