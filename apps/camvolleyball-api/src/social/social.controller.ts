import { Controller, Post, Delete, Param, UseGuards, Get, Request } from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
    constructor(private readonly socialService: SocialService) { }

    @Post('follow/:id')
    async follow(@Param('id') followingId: string, @Request() req) {
        return this.socialService.followUser(req.user.userId, followingId);
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
