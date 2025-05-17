import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {HttpsProxyAgent} from 'https-proxy-agent';
import config from '../../config';

const httpsAgent = config.CHAIN_DATA.NETWORK.USE_PROXY
    ? new HttpsProxyAgent(config.CHAIN_DATA.NETWORK.PROXY_URL)
    : undefined;


export function axiosGetSmart<T = any>(
    url: string,
    axiosConfig: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> {
    return axios.get<T>(url, {
        timeout: config.NETWORK_TIMEOUT,
        httpsAgent,
        proxy: false,
        ...axiosConfig,
    });
}


export function axiosPostSmart<T = any>(
    url: string,
    data: any,
    axiosConfig: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> {
    return axios.post<T>(url, data, {
        httpsAgent,
        proxy: false,
        ...axiosConfig,
    });
}
