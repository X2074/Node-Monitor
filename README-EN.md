# Node-Monitor

## Project Installation

```shell
npm install
```


##  Compilation and Hot Reloading in Development Mode

```shell
npm run start -- --chain=mainnet
npm run start -- --chain=testnet
```

##  Project Structure Overview

```
├── src                         # Source code
│   ├── api                     # API configuration files
│   │   ├── rpc_base.js         # Basic configuration
│   │   ├── rpc_chain.js        # Chain configuration
│   │   └── rpc_local.js        # Local configuration  
│   ├── config                  # Configuration files
│   │   ├── default.js          # Default configuration
│   │   └── index.js            # Configuration index file
│   ├── routes                  # Route configuration
│   │   ├── baseRoutes.js       # Basic routes configuration
│   │   ├── emailRoutes.js      # Email-related routes
│   │   ├── nodeRoutes.js       # Node routes
│   │   └── taskRoutes.js       # Task routes
│   ├── services                # Service-related code
│   │   ├── health              # Health check services
│   │   │   ├── blockHeightHistory.js   # Block height history service
│   │   │   ├── healthMonitorService.js # Health monitoring service
│   │   │   └── utxoHealthService.js   # UTXO health monitoring service
│   │   ├── mail                # Mail services
│   │   │   └── mailService.js  # Email sending service
│   │   └── node                # Node services
│   │       ├── chainDataService.js   # Chain data service
│   │       └── nodeStatusService.js  # Node status service
│   ├── templates               # Email templates
│   │   └── emailTemplates.json # Email template configuration file
│   ├── utils                   # Utility functions
│   │   ├── action.js           # Action utility
│   │   ├── cronUtil.js         # Cron job utility
│   │   ├── httpResponse.js     # HTTP response utility
│   │   ├── logger.js           # Logger utility
│   │   ├── proxyAxios.js       # Axios proxy utility
│   │   └── restart.js          # Restart utility
│   ├── app.js                  # Application configuration
│   └── index.js                # Entry point file
├── .env.example                # Environment variables example file
├── .gitignore                  # Git ignore configuration file
└── package.json                # Project dependencies configuration
```
