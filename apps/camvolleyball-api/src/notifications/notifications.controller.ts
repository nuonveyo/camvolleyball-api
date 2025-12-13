import { Controller, Get, Post, Param, Inject, UseGuards, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(@Inject('NOTIFICATIONS_SERVICE') private client: ClientProxy) { }

    @Get()
    getMyNotifications(@Request() req) {
        return this.client.send('get_notifications', req.user.userId);
    }

    @Post(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.client.send('mark_read', id);
    }
}
