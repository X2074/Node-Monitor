const {ACCESS_ALLOW_IPS, ACCESS_USERNAME, ACCESS_PASSWORD} = require('../config');

/**
 * Middleware to secure access to sensitive routes.
 * Allows requests from specific IPs or via valid Basic Auth credentials.
 */
function secureAccess() {
    // Parse the allowed IPs from the environment configuration
    const allowedIPs = ACCESS_ALLOW_IPS.split(',').map(ip => ip.trim());
    const username = ACCESS_USERNAME;
    const password = ACCESS_PASSWORD;

    // Return an Express middleware function
    return function (req, res, next) {
        const ip = req.ip || req.connection.remoteAddress;

        // ✅ Allow access if request comes from a whitelisted IP
        if (allowedIPs.includes(ip)) {
            return next();
        }

        // ✅ Allow access if Basic Auth credentials match
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Basic ')) {
            const base64Credentials = authHeader.split(' ')[1];
            const [user, pass] = Buffer.from(base64Credentials, 'base64').toString().split(':');

            if (user === username && pass === password) {
                return next();
            }
        }

        // ❌ If neither IP nor credentials are valid, deny access
        res.setHeader('WWW-Authenticate', 'Basic realm="Restricted"');
        return res.status(401).json({
            message: 'Access denied: IP not allowed or invalid credentials.'
        });
    };
}

module.exports = {secureAccess};
