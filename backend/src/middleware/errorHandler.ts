import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
    err: AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    }

    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        res.status(500).json({
            error: 'Internal Server Error',
        });
        return;
    }

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
    });
}

/**
 * Create an operational error
 */
export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string = 'Bad Request') {
        return new ApiError(message, 400);
    }

    static unauthorized(message: string = 'Unauthorized') {
        return new ApiError(message, 401);
    }

    static forbidden(message: string = 'Forbidden') {
        return new ApiError(message, 403);
    }

    static notFound(message: string = 'Not Found') {
        return new ApiError(message, 404);
    }

    static conflict(message: string = 'Conflict') {
        return new ApiError(message, 409);
    }

    static internal(message: string = 'Internal Server Error') {
        return new ApiError(message, 500);
    }
}

export default { errorHandler, notFoundHandler, ApiError };
