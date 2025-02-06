## preview-code

前端代码预览工具，利用WebContainer在浏览器启动devServer进行预览，可以嵌入其他页面进行更好的代码展示，目前支持github仓库代码拉取，后续可能会支持其他仓库。

### 计划

- [x] github仓库代码拉取
- [x] WebContainer 文件系统挂载、安装依赖、启动server，监听目录变化同步文件更新
- [x] 项目目录文件树展示
- [x] monaco-editor 代码接入， 支持浏览、编辑、保存（当前会话期内生效）代码
- [x] devServer 内容预览
- [x] xTerm 终端接入，支持webContainer交互
- [x] shadcn/ui 接入，优化布局样式
- [x] 面板支持折叠收起/展开，顶栏图标控制，支持快捷键操作
- [ ] 目录树右键菜单支持新建、删除、重命名文件/文件夹
- [ ] 编辑器支持多开，双击打开时可保留当前编辑器，单击打开未编辑不保留
- [x] 多终端支持


### ToFix

- [ ] 主题切换时改变xterm背景色
- [ ] shadcn/ui css变量实效，可能与tailwindcss v4有关
