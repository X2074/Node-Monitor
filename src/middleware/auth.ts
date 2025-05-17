import {NextFunction, Request, Response} from 'express';
import config from '../config';

/**
 * Middleware to secure access to sensitive routes.
 * Allows requests from specific IPs or via valid Basic Auth credentials.
 */
export function secureAccess() {
    // Parse the allowed IPs from the environment configuration
    const allowedIPs = config.ACCESS_ALLOW_IPS.split(',').map(ip => ip.trim());
    const username = config.ACCESS_USERNAME;
    const password = config.ACCESS_PASSWORD;

    return (req: Request, res: Response, next: NextFunction): void => {
        const ip = req.ip || req.socket.remoteAddress || '';

        // Allow access if IP is in whitelist
        if (allowedIPs.includes(ip)) {
            return next();
        }

        // Allow access via Basic Auth
        const authHeader = req.headers['authorization'];
        if (authHeader?.startsWith('Basic ')) {
            const base64Credentials = authHeader.split(' ')[1];
            const decoded = Buffer.from(base64Credentials, 'base64').toString();
            const [user, pass] = decoded.split(':');

            if (user === username && pass === password) {
                return next();
            }
        }

        //  Deny access
        res.setHeader('WWW-Authenticate', 'Basic realm="Restricted"');
        res.status(401).json({
            message: 'Access denied: IP not allowed or invalid credentials.',
        });
    };
}
