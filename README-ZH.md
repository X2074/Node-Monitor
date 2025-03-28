# Node-Monitor


##  项目安装

```shell
npm install
```

##  开发模式下的编译和热重载

```shell
npm run start -- --chain=mainnet
npm run start -- --chain=testnet
```

##  项目结构简介

```
├── src                         # 源代码
│   ├── api                     # API 配置文件
│   │   ├── rpc_base.js         # 基础配置
│   │   ├── rpc_chain.js        # 链配置
│   │   └── rpc_local.js        # 本地配置  
│   ├── config                  # 配置文件
│   │   ├── default.js          # 默认配置
│   │   └── index.js            # 配置索引文件
│   ├── routes                  # 路由配置
│   │   ├── baseRoutes.js       # 基本路由配置
│   │   ├── emailRoutes.js      # 邮件相关路由
│   │   ├── nodeRoutes.js       # 节点路由
│   │   └── taskRoutes.js       # 任务路由
│   ├── services                # 服务相关代码
│   │   ├── health              # 健康检查服务
│   │   │   ├── blockHeightHistory.js   # 区块高度历史服务
│   │   │   ├── healthMonitorService.js # 健康监控服务
│   │   │   └── utxoHealthService.js   # UTXO 健康监控服务
│   │   ├── mail                # 邮件服务
│   │   │   └── mailService.js  # 邮件发送服务
│   │   └── node                # 节点服务
│   │       ├── chainDataService.js   # 链数据服务
│   │       └── nodeStatusService.js  # 节点状态服务
│   ├── templates               # 邮件模板
│   │   └── emailTemplates.json # 邮件模板配置文件
│   ├── utils                   # 工具函数
│   │   ├── action.js           # 操作工具
│   │   ├── cronUtil.js         # Cron 工具
│   │   ├── httpResponse.js     # HTTP 响应工具
│   │   ├── logger.js           # 日志工具
│   │   ├── proxyAxios.js       # Axios 代理工具
│   │   └── restart.js          # 重启工具
│   ├── app.js                  # 应用配置
│   └── index.js                # 入口文件
├── .env.example                # 环境变量示例文件
├── .gitignore                  # Git 忽略配置文件
└── package.json                # 项目依赖配置
```
