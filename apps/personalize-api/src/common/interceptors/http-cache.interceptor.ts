import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
    trackBy(context: ExecutionContext): string | undefined {
        const request = context.switchToHttp().getRequest();
        const isGetRequest = request.method === 'GET';
        const requestUrl = request.url;
        // user might be undefined if public
        const userId = request.user?.userId ? `user:${request.user.userId}` : 'public';

        if (!isGetRequest) {
            return undefined;
        }

        // Key: /personalize/v1/posts?page=1-user:123
        return `${requestUrl}-${userId}`;
    }
}
