# Node-Monitor


##  Project Installation

```shell
npm install
```

##  Compilation and thermal overloading for development

```shell
npm run start -- --chain=mainnet
npm run start -- --chain=testnet
```

##  Introduction to Project Structure

```
├── src                         # Source code
│   ├── config                  # Configuration files
│   │   ├── default.js          # Default configuration
│   │   └── index.js            # Configuration index file
│   ├── services                # Service related code
│   │   ├── cheerioService.js   # Cheerio service
│   │   ├── mailService.js      # Mail service
│   │   ├── monitorService.js   # Monitoring service
│   │   ├── nodeApiService.js   # Node API service
│   │   ├── nodeService.js      # Node service
│   │   ├── qitmeerApiService.js # Qitmeer API service
│   │   └── restartService.js   # Restart service
│   ├── utils                   # Utility functions
│   │   ├── cacheUtils.js       # Cache utility
│   │   ├── cronUtil.js         # Cron job utility
│   │   ├── httpResponse.js     # HTTP response utility
│   │   ├── logger.js           # Logger utility
│   ├── app.js                  # Application configuration
│   └── index.js                # Common entry point
├── .env.example                # Example of environment variables
├── .gitignore                  # Git ignore file configuration
├── package.json                # Project dependencies configuration
└── package-lock.json           # Locked dependency versions
```
