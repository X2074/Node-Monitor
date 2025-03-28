# Configuration Documentation

## Basic Service Configuration

| Configuration Item | Description                                 |
|--------------------|---------------------------------------------|
| `PORT`             | The port for the service to listen on, default is 9090. |

## Email Notification Configuration

| Configuration Item     | Description                                               |
|------------------------|-----------------------------------------------------------|
| `EMAIL_HOST`           | The host address of the email sending server              |
| `EMAIL_PORT`           | The port for sending emails, 465 is commonly used for SSL encryption |
| `EMAIL_SECURE`         | Whether to enable SSL encryption, `true` means enabled, `false` means disabled |
| `EMAIL_USER`           | The email address of the sender                           |
| `EMAIL_PASS`           | The password for the sender's email account               |
| `EMAIL_RECIPIENTS`     | The email address of the recipient                        |
| `SERVER_IP`            | The server's IP address                                  |

## Qitmeer Node RPC Access

| Configuration Item     | Description                                               |
|------------------------|-----------------------------------------------------------|
| `NODE_URL`             | The RPC URL for the Qitmeer node                         |
| `QITMEER_USERNAME`     | The username for the Qitmeer node                         |
| `QITMEER_PASSWORD`     | The password for the Qitmeer node                         |

## Chain API Configuration

| Configuration Item        | Description                                                |
|---------------------------|------------------------------------------------------------|
| `CHAIN_TYPE`              | The type of the chain: `mainnet` for mainnet or `testnet` for testnet |
| `MAINNET_CHAIN_ID`        | The chain ID for the mainnet                               |
| `TESTNET_CHAIN_ID`        | The chain ID for the testnet                               |
| `CHAIN_DATA_BASE`         | The base URL for chain data                               |
| `CHAIN_DATA_FORMAT`       | The format for the chain data, `{chainId}` is dynamic and represents different chains |

## Network Proxy Configuration

| Configuration Item     | Description                                                 |
|------------------------|-------------------------------------------------------------|
| `USE_PROXY`            | Whether to use a proxy, `false` means not enabled, `true` means enabled |
| `PROXY_URL`            | The URL and port for the proxy server                      |

## Monitoring Task Configuration

| Configuration Item       | Description                                              |
|--------------------------|----------------------------------------------------------|
| `MONITOR_TASK_CRON`      | The cron expression for the monitoring task, set to run every minute here |
| `SCRIPTS_DIR`            | The directory path for storing scripts                   |

## Monitoring Parameters

| Configuration Item             | Description                                               |
|---------------------------------|-----------------------------------------------------------|
| `MAX_HISTORY`                  | Maximum number of historical records, older records will be deleted after exceeding this number |
| `SYNC_THRESHOLD_PERCENT`       | Sync threshold percentage, indicating the maximum allowable discrepancy for node synchronization |
| `SYNC_RATE_THRESHOLD`          | Sync rate threshold, indicating the minimum required sync rate for nodes |
| `JUMP_THRESHOLD`               | Node height jump threshold, triggers an exception if the height jump exceeds this value |
| `STUCK_THRESHOLD`              | Node stuck threshold, triggers an exception if the node is stuck for 3 consecutive times without syncing data |
| `HEIGHT_DIFF_THRESHOLD`        | Node height difference threshold, triggers an exception if the difference between the chain and local node height exceeds this value |
| `MAX_RESTART_ATTEMPTS`         | Maximum number of restart attempts, stops restarting if the limit is reached without recovery |
| `BLOCK_RATE_THRESHOLD`         | Block generation rate threshold, triggers a warning if the rate is below this value |

## Node Process Configuration

| Configuration Item        | Description                                |
|---------------------------|--------------------------------------------|
| `NODE_PROCESS_NAME`       | The name of the Qitmeer node process       |
| `START_SCRIPT`            | The name of the start script               |
| `STOP_SCRIPT`             | The name of the stop script                |

## Configuration for Block Lag Check

| Configuration Item        | Description                                |
|---------------------------|--------------------------------------------|
| `BLOCK_LAG_CHECK`         | Whether to check block generation delay, `true` means enabled, `false` means disabled (this configuration is enabled) |
 