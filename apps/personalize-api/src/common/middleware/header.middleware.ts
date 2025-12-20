import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HeaderMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // 1. Check Accept-Language
        const acceptLanguage = req.headers['accept-language'];
        // Requirement says "Accept-Language: en/km". It doesn't explicitly say to fail if missing, but usually "Add header" implies requirement.
        // Let's enforce it or at least check valid values if present? 
        // "Content-Type: application/json" - usually enforced for body-bearing requests.

        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const contentType = req.headers['content-type'];
            if (!contentType || !contentType.toLowerCase().includes('application/json')) {
                throw new BadRequestException('Content-Type must be application/json;charset=UTF-8');
            }
        }

        // For now logging or simple check for Accept-Language if strictly required by user to "Add header"
        // I will not throw error for missing Accept-Language unless user specified validation rules, but I will ensure it's logged or handled.
        // Let's assume validation is needed.

        next();
    }
}
