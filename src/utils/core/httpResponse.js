function success(res, data) {
    res.status(200).json({ success: true, data });
}

function error(res, message, statusCode = 500) {
    res.status(statusCode).json({ success: false, message });
}

module.exports = { success, error };
