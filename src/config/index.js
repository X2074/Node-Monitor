const defaultConfig = require('./default');
const environment = process.env.NODE_ENV || 'development';

let environmentConfig = {};
try {
    environmentConfig = require(`./${environment}`);
} catch (error) {
    console.warn(`No specific config for environment: ${environment}`);
}

module.exports = { ...defaultConfig, ...environmentConfig };
