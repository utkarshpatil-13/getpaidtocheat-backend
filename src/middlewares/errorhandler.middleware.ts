import { Context } from 'hono';
import { ApiError } from '../utils/apierror';

const errorHandler = (err: any, c: Context) => {
    console.error('Error caught in middleware:', err);

    if (err instanceof ApiError) {
        const statusCode = (err.statusCode || 400) as 200 | 400 | 404 | 500; // Explicitly typing the status code
        c.status(statusCode);
        return c.json({
            success: false,
            statusCode: statusCode,
            message: err.message,
            errors: err.errors || [],
        });
    }

    // For unexpected errors
    c.status(500); // Assigning the status code
    return c.json({
        success: false,
        statusCode: 500,
        message: 'Internal Server Error',
    });
};

export { errorHandler };
