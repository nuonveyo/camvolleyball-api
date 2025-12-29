import { Controller, Get, Post, Param, Inject, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(@Inject('NOTIFICATIONS_SERVICE') private client: ClientProxy) { }

    @Get()
    @ApiOperation({ summary: 'Get current user notifications' })
    @ApiResponse({ status: 200, description: 'Return list of notifications' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getMyNotifications(@Request() req, @Query() query: { page?: any, limit?: any }) {
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 20;
        return this.client.send('get_notifications', { userId: req.user.userId, page, limit });
    }

    @Post(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiResponse({ status: 200, description: 'Notification marked as read' })
    markAsRead(@Param('id') id: string) {
        return this.client.send('mark_read', id);
    }
}
