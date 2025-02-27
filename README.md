![宣传图](src/assets/poster.png)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FLiRenTech%2Fproject-graph.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FLiRenTech%2Fproject-graph?ref=badge_shield)

# Project Graph

## 下载地址

> [tauri版本](https://project-graph.top)
>
> （用新的框架重写了，功能还在完善中，但还未发布视频）
>
> 上述网页中有两个版本
>
> 开发版：每天早晨8点左右自动根据git上的最新情况打包构建发布
>
> 稳定版：手动发布的稳定版，不一定最新

> [PyQt5版本（两期视频中的版本）](https://github.com/LiRenTech/project-graph/releases/tag/pyqt-2024-10-3)

## 开发者启动方式

```bash
# 安装依赖
pnpm i
# 启动项目
pnpm tauri dev
# 在adb设备上启动
```

注意：请确保已安装 Rust 和 Node.js 环境。windows还需安装c++编译工具，具体详见

```
https://littlefean.github.io/2024/09/28/tauri%E9%A1%B9%E7%9B%AE%E5%9C%A8windows%E4%B8%8A%E7%9A%84%E5%BC%80%E5%8F%91%E8%B8%A9%E5%9D%91/
```

### MacOs

目前由于开发者无MacOs设备，无法测试，如果您是mac用户，可以将 `src-tauri/tauri.conf.json` 中的项进行以下修改后再打包：

```js
  "app": {
    "windows": [
      {
        "title": "Project Graph",
        "width": 1200,
        "height": 800,
        "decorations": true,  // 修改
        "transparent": false,  // 修改
        "visible": false,  // 添加此项
        "dragDropEnabled": false
      }
    ],
    "macOSPrivateApi": true,  // 添加此项
    "security": {
      "csp": null,
      "capabilities": []
    }
  },
```

### 一键安装配置环境

如果感觉配置过程过于麻烦，可以使用xlings工具一键安装并配置环境

```
xlings install
```

> 注:
>
> - 目前已测试系统: [windows](https://github.com/LiRenTech/project-graph/issues/139#issuecomment-2470110723)、[ubuntu](https://github.com/LiRenTech/project-graph/issues/139#issuecomment-2474507140)
> - [更多一键环境配置讨论](https://github.com/LiRenTech/project-graph/issues/139)

## 开发注意事项

若发现修改代码后无法热更新或者出现诡异bug，用ctrl+shift+i进入DevTools控制台后，在控制台窗口激活的情况下，按 Ctrl+Shift+R 刷新（因为窗口屏蔽了Ctrl+Shift+R快捷键，但无法屏蔽F5刷新和ctrl+shift+i等特殊的快捷键）注：F5刷新和Ctrl+Shift+R刷新不一样，F5不会刷掉缓存，Ctrl+Shift+R会刷掉缓存。

## 打包可执行文件

```
pnpm tauri build
```

如果是windows，可能还会遇到网络问题

```
https://github.com/tauri-apps/tauri/issues/7338
```

详见上述情况解决

## 注：

由于 PyQt5 绘制类Canvas的性能问题，已被抛弃，目前采用了Tauri作为GUI框架，并使用TypeScript (React) 和Rust语言编写。

—— 2024年10月2日

项目的 docs/ 文件夹下有一些示例json文件，下载软件后您可以尝试导入看看。其中记录和沉淀了项目的一些开发信息。

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FLiRenTech%2Fproject-graph.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FLiRenTech%2Fproject-graph?ref=badge_large)
