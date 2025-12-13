import { Controller, Post, Body, Inject, UseGuards, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GetPresignedUrlDto } from '@app/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Controller('files')
export class FileController {
    constructor(@Inject('FILE_SERVICE') private client: ClientProxy) { }

    @UseGuards(JwtAuthGuard)
    @Post('presigned-url')
    getPresignedUrl(@Body() dto: GetPresignedUrlDto) {
        return this.client.send('get_presigned_url', dto).pipe(
            catchError(error => throwError(() => new BadRequestException(error.message || 'Failed to get presigned URL')))
        );
    }
}
