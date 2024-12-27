# 选择 Tauri 框架重写应用的原因

结论：为了提升性能、简化开发和降低法律风险，我们决定使用 Tauri 框架重写应用。

### 论据一：提高绘制性能与流畅度

问题：Python 及其 PyQt5 库在处理类似 Canvas 的应用时，如画板应用，其绘制速度较慢，实测 FPS 仅约 15 帧。

解决方案：前端 JavaScript 的 Canvas API 能调用 GPU 加速，实现更高的绘制效率，可达 60FPS，确保了画面的流畅性。Tauri 框架允许我们利用这些前端技术，从而显著改善用户体验。

### 论据二：优化复杂大型应用的开发体验

问题：Python 不擅长构建复杂的大型应用，尤其是在处理模块间的循环导入问题上；此外，异步编程相对复杂。

解决方案：TypeScript 提供了更好的模块管理机制，几乎不存在循环导入的问题，并且原生支持异步编程，使得代码更加简洁和易于维护。Tauri 框架结合 TypeScript，为开发复杂桌面应用提供了强有力的支持。

### 论据三：利用成熟的 UI 设计工具

问题：前端技术在 UI 设计方面具有天然优势，如 CSS 中的 Flex 和 Grid 布局，以及丰富的动画框架，而 PyQt5 在这方面的表现较为逊色。

解决方案：通过 Tauri 框架，我们可以充分利用前端技术的优势，快速构建美观且响应式的用户界面。

### 论据四：顺应未来趋势

> Any application that can be written in JavaScript, will eventually be written in JavaScript.

观点：我们认为前端技术是未来桌面应用开发的趋势，采用 Tauri 框架有助于我们在技术选型上保持前瞻性。

### 论据五：降低法律风险

问题：PyQt5 采用 GPL3.0 开源协议，该协议对软件分发有严格要求，可能导致潜在的法律风险。

解决方案：Tauri 框架采用更为宽松的开源协议，降低了我们在法律合规上的顾虑，使项目更加安全可靠。