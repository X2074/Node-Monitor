import { Response } from 'express';

export function success<T = any>(res: Response, data: T): void {
    res.status(200).json({ success: true, data });
}

export function error(res: Response, message: string, statusCode: number = 500): void {
    res.status(statusCode).json({ success: false, message });
}
