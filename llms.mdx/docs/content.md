# Shell++ 文档 (/docs)



Shell++ 是一套面向 Xiaomi Vela 设备的实验性开源工具链。它把手环端的
**Vela Quick App**、负责执行系统任务的 **Lua 后端**，以及 Android 和
AstroBoxV2 接收端连接起来，让截图、终端、文件与设备状态能够在多个设备之间流动。

<Cards>
  <Card title="快速开始" description="安装手环端与 Lua 资源，并完成第一次连接。" href="/docs/install-watch-and-lua" />

  <Card title="探索架构" description="认识 Quick App、Lua、Interconnect 与接收端之间的关系。" href="/docs/architecture" />

  <Card title="Shell++ 的故事" description="从一次截图与终端需求，到一套完整的设备工具链。" href="/docs/shellpp" />

  <Card title="下载 Shell++" description="获取手环端、Android 端与相关组件。" href="https://shellpp.cxkpro.top/download/" />
</Cards>

## Shell++ 能做什么 [#shell-能做什么]

* 在手环上发起截图，并将截图同步到 Android 或 AstroBoxV2。
* 从接收端向手环发送终端命令，查看标准输出、错误信息与退出状态。
* 浏览和管理设备文件，让设备产生的数据不再停留在手环内部。
* 查看设备信息、CPU 与内存状态，辅助调试与性能分析。
* 通过 Android 应用或 AstroBoxV2 插件建立适合当前平台的工作流。

## 开始之前 [#开始之前]

Shell++ 会接触设备文件、系统命令和调试能力，部分操作具有风险。项目内置了针对已知
高风险指令的保护机制，但它不能替代谨慎判断。执行不熟悉的命令前，请先确认命令作用，
并备份重要数据。

准备好后，从[选择 Android 还是 AstroBox](/docs/choose-android-or-astrobox)开始，
或直接前往[安装手环端与 Lua 资源](/docs/install-watch-and-lua)。
