import { Controller, Get, Post, Param, Inject, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
    getMyNotifications(@Request() req) {
        return this.client.send('get_notifications', req.user.userId);
    }

    @Post(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiResponse({ status: 200, description: 'Notification marked as read' })
    markAsRead(@Param('id') id: string) {
        return this.client.send('mark_read', id);
    }
}
