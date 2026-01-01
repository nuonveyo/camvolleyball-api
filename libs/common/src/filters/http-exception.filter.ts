import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly i18n: I18nService) { }

    async catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse: any = exception.getResponse();

        let message = 'Internal server error';
        let error = 'Error';

        // Extract key and arguments if available
        let translationKey = '';
        let translationArgs = {};

        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
            translationKey = exceptionResponse;
        } else if (typeof exceptionResponse === 'object') {
            // Handle ValidationPipe array of messages
            if (Array.isArray(exceptionResponse.message)) {
                message = exceptionResponse.message[0]; // Take the first error message
                translationKey = exceptionResponse.message[0];
            } else {
                message = exceptionResponse.message?.toString() || message;
                translationKey = exceptionResponse.message?.toString() || '';
            }
            error = exceptionResponse.error || error;
        }

        // Attempt Translation
        const lang = I18nContext.current()?.lang || 'en';
        try {
            // Only translate if the key looks like a translation key (e.g. 'auth.user_not_found')
            // or if we just want to try translating everything.
            // For now, we try to translate everything.
            const translated = await this.i18n.translate(`events.${translationKey}`, {
                lang: lang,
                args: translationArgs,
            });

            // If translation returns the key itself (meaning missing), fallback to original
            if (translated !== `events.${translationKey}`) {
                message = translated;
            }
        } catch (e) {
            // Fallback to original message if translation fails
        }

        // Determine HTTP Status Code
        const httpStatus = status; // Use the exception status (400, 404, 500, etc.)

        response.status(httpStatus).json({
            status: status,
            message: message,
            error: error,
            statusCode: httpStatus,
        });
    }
}
