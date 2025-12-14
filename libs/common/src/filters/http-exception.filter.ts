import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse: any = exception.getResponse();

        let message = 'Internal server error';
        let error = 'Error';

        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        } else if (typeof exceptionResponse === 'object') {
            // Handle ValidationPipe array of messages
            if (Array.isArray(exceptionResponse.message)) {
                message = exceptionResponse.message[0]; // Take the first error message
            } else {
                message = exceptionResponse.message?.toString() || message;
            }
            error = exceptionResponse.error || error;
        }

        // Determine HTTP Status Code
        // Default: 201 Created (Success) for Logic/Validation errors to mask them
        let httpStatus = HttpStatus.CREATED;

        // Exception: Security errors (401, 403) return actual status
        if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
            httpStatus = status;
        }

        response.status(httpStatus).json({
            status: status, // Original error code (e.g. 400, 404, 500)
            message: message,
            error: error,
            statusCode: httpStatus, // Actual HTTP Status sent (201, 401, 403)
        });
    }
}
