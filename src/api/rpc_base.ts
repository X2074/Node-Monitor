import axios, {AxiosRequestConfig} from 'axios';
import config from '../config';
import logger from '../utils/core/logger';
import https from 'https';

interface JsonRpcRequest {
    jsonrpc: string;
    method: string;
    params?: any[];
    id?: number | string;
}

interface JsonRpcResponse<T = any> {
    jsonrpc: string;
    result?: T;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    id: number | string;
}

interface AuthConfig {
    username: string;
    password: string;
}

/**
 * Sends an RPC request to the given URL.
 * @param rpcUrl - The URL of the RPC endpoint.
 * @param requestData - The request data to send.
 * @param auth - Optional authentication object.
 * @returns The result of the RPC request.
 */
export async function sendJsonRpcRequest<T = any>(
    rpcUrl: string,
    requestData: JsonRpcRequest,
    auth: AuthConfig | null = null
): Promise<T> {
    try {
        const options: AxiosRequestConfig = {
            headers: { 'Content-Type': 'application/json' },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: config.NETWORK_TIMEOUT,
        };

        if (auth) {
            options.auth = auth;
        }
        const response = await axios.post<JsonRpcResponse<T>>(rpcUrl, requestData, options);

        logger.debug(`Full response: ${JSON.stringify(response.data, null, 2)}`);

        return response.data.result as T;

    } catch (error: any) {
        logger.info(`🚨 Error fetching data from ${rpcUrl}: ${error.message}`);
        throw error;
    }
}

/**
 * Returns the authentication object for Qitmeer RPC requests.
 * @returns The authentication object containing username and password.
 */
export function getAuth(): { username: string; password: string } {
    return {
        username: config.qitmeer.username,
        password: config.qitmeer.password,
    };
}

