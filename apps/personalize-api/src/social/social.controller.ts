import { Controller, Post, Delete, Param, UseGuards, Get, Request, Inject } from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientProxy } from '@nestjs/microservices';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
    constructor(
        private readonly socialService: SocialService,
        @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsClient: ClientProxy,
    ) { }

    @Post('follow/:id')
    async follow(@Param('id') followingId: string, @Request() req) {
        const result = await this.socialService.followUser(req.user.userId, followingId);
        if (result.status === 'success') {
            this.notificationsClient.emit('notify_user', {
                recipientId: followingId, // Person being followed
                actorId: req.user.userId,
                type: 'FOLLOW',
                message: 'started following you',
            });
        }
        return result;
    }

    @Delete('follow/:id')
    async unfollow(@Param('id') followingId: string, @Request() req) {
        return this.socialService.unfollowUser(req.user.userId, followingId);
    }

    @Get('followers')
    async getMyFollowers(@Request() req) {
        return this.socialService.getFollowers(req.user.userId);
    }

    @Get('following')
    async getMyFollowing(@Request() req) {
        return this.socialService.getFollowing(req.user.userId);
    }
}
