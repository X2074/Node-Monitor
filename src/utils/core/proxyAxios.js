const axios = require("axios");
const {HttpsProxyAgent} = require("https-proxy-agent");
const config = require("../../config");

let httpsAgent = null;
if (config.CHAIN_DATA.NETWORK.USE_PROXY) {
    httpsAgent = new HttpsProxyAgent(config.CHAIN_DATA.NETWORK.PROXY_URL);
}


function axiosGetSmart(url, axiosConfig = {}) {
    return axios.get(url, {
        httpsAgent: config.CHAIN_DATA.NETWORK.USE_PROXY ? httpsAgent : undefined,
        proxy: false,
        ...axiosConfig,
    });
}


function axiosPostSmart(url, data, axiosConfig = {}) {
    return axios.post(url, data, {
        httpsAgent: config.CHAIN_DATA.NETWORK.USE_PROXY ? httpsAgent : undefined,
        proxy: false,
        ...axiosConfig,
    });
}

module.exports = {
    axiosGetSmart,
    axiosPostSmart,
};
