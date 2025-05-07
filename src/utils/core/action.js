const logger = require("./logger");
const {success, error} = require("./httpResponse");
const handleNodeAction = async (action, successMessage, errorMessage, res) => {
    try {
        await action();
        logger.info(successMessage);
        success(res, successMessage);
    } catch (err) {
        logger.error(`${errorMessage}: ${err.message}`);
        error(res, errorMessage);
    }
};

module.exports = {handleNodeAction};