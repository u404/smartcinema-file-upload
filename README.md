# 移动电影院内部上传文件组件

> 通过vscode插件，实现快速高效的OSS文件上传


### 快速上传

> 第一次需要输入`AccessToken`，配置为：公司gitlab账号的Personal Token

#### 开始使用
- 鼠标右键菜单，选择 `上传文件到OSS` 或 `上传文件到OSS（海外版）`
- 快捷键 `ctrl + shift + F` 或 `command + shift + F`，海外版快捷键 `ctrl + alt + shift + F` 或 `command + alt + shift + F`
- 命令面板搜索 `上传文件到OSS` 或 `上传文件到OSS（海外版）` ，然后点击结果项

#### 注意事项
- 文件支持全部类型，但不要随便上传无用文件
- 远程路径尽可能配置为：images/xxxx.jpg、files/xxxx.json、libs/xxxx.js 等形式，对资源进行分类存储
- 所有文件的远程路径的配置，务必确认，没有覆盖现有的线上资源
- html文件的远程路径请根据需要进行配置。在不与其他资源冲突的情况下，配置为相对友好的路径


