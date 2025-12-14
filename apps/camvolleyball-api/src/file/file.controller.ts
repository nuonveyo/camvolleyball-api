import { Controller, Post, Body, Inject, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { GetPresignedUrlDto } from '@app/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
    constructor(@Inject('FILE_SERVICE') private client: ClientProxy) { }

    @UseGuards(JwtAuthGuard)
    @Post('presigned-url')
    @ApiOperation({ summary: 'Get presigned URL for file upload' })
    @ApiResponse({ status: 201, description: 'Presigned URL returned' })
    getPresignedUrl(@Body() dto: GetPresignedUrlDto) {
        return this.client.send('get_presigned_url', dto).pipe(
            catchError(error => throwError(() => new BadRequestException(error.message || 'Failed to get presigned URL')))
        );
    }
}
