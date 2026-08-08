# 支持的设备与平台 (/docs/supported-devices-and-platforms)



Shell++ 当前面向能够安装 Vela Quick App、部署配套 Lua 资源，并允许接收端建立通信的
Xiaomi Vela 手环或手表。兼容性取决于系统能力，不应只根据外观或产品系列判断。

## 手环或手表 [#手环或手表]

目前仅支持小米手环9Pro，小米手环10Pro及红米手表6

## Android [#android]

Shell++ Android 的最低系统版本为 Android 8.0（API 26）。应用还依赖 Xiaomi Wearable，请确保安装了小米运动健康应用相关通信能力，
因此手机系统版本符合要求并不代表一定能发现手环；手环需要先在对应的穿戴
设备环境中完成配对和连接。传输过程中，请确保小米运动健康与手环保持连接。

## AstroBoxV2插件 [#astroboxv2插件]

插件适用于能够运行当前 AstroBoxV2、加载 `.abp` 插件并连接目标 Vela 设备的平台。桌面端通常包括 Windows、macOS 和 Linux。其他平台是否可用，以 AstroBoxV2 当前版本提供的能力和插件加载支持为准。

## 版本兼容 [#版本兼容]

Quick App、Lua 资源和接收端会共同参与协议交互。优先从同一次 Shell++ Release 获取各组件。
混用不同版本时，可能出现握手成功但部分功能不可用、字段无法识别或任务无响应。

确认环境后，继续[安装手环端与 Lua 资源](/docs/install-watch-and-lua)。
