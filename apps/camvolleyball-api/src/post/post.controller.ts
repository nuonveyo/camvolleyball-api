import { Controller, Get, Post, Body, Param, Delete, Inject, UseGuards, Request, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreatePostDto, UpdatePostDto, PaginationDto, CreateCommentDto } from '@app/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SocialService } from '../social/social.service';
import { JwtService } from '@nestjs/jwt';

@Controller('posts')
export class PostController {
    constructor(
        @Inject('POST_SERVICE') private client: ClientProxy,
        private readonly socialService: SocialService,
        private readonly jwtService: JwtService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreatePostDto, @Request() req) {
        dto.userId = req.user.userId;
        return this.client.send('create_post', dto);
    }

    @Get()
    async findAll(@Query() paginationDto: PaginationDto, @Request() req) {
        let userId: string | null = null;
        let followingIds: string[] = [];

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = this.jwtService.decode(token) as any;
                if (decoded && decoded.sub) {
                    userId = decoded.sub;
                    if (userId) {
                        followingIds = await this.socialService.getFollowingIds(userId);
                    }
                }
            } catch (e) {
                // Ignore invalid token, treat as guest
            }
        }

        return this.client.send('find_all_posts', { ...paginationDto, userId, followingIds });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.client.send('find_one_post', id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id') // Using Post for update
    update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Request() req) {
        dto.id = id;
        dto.userId = req.user.userId;
        return this.client.send('update_post', dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.client.send('remove_post', { id, userId: req.user.userId });
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/comments')
    addComment(@Param('id') id: string, @Body() dto: CreateCommentDto, @Request() req) {
        dto.postId = id;
        dto.userId = req.user.userId;
        return this.client.send('add_comment', dto);
    }

    @Get(':id/comments')
    findComments(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
        return this.client.send('find_comments', { postId: id, pagination: paginationDto });
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/likes')
    toggleLike(@Param('id') id: string, @Request() req) {
        return this.client.send('toggle_like', { postId: id, userId: req.user.userId });
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/shares')
    sharePost(@Param('id') id: string, @Request() req) {
        return this.client.send('share_post', { postId: id, userId: req.user.userId });
    }
}
