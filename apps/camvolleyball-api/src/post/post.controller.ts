import { Controller, Get, Post, Body, Param, Delete, Inject, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { CreatePostDto, UpdatePostDto, PaginationDto, CreateCommentDto, CreateShareDto } from '@app/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SocialService } from '../social/social.service';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
export class PostController {
    constructor(
        @Inject('POST_SERVICE') private client: ClientProxy,
        private readonly socialService: SocialService,
        private readonly jwtService: JwtService,
        @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsClient: ClientProxy,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Create a new post' })
    @ApiResponse({ status: 201, description: 'Post created' })
    async create(@Body() dto: CreatePostDto, @Request() req) {
        dto.userId = req.user.userId;
        const post = await this.client.send('create_post', dto).toPromise();

        // Notify followers
        const followers = await this.socialService.getFollowers(req.user.userId);
        // followers is User[]
        followers.forEach(follower => {
            this.notificationsClient.emit('notify_user', {
                recipientId: follower.id,
                actorId: req.user.userId,
                type: 'NEW_POST',
                entityId: post.id,
                message: 'created a new post',
            });
        });

        return post;
    }

    @Get()
    @ApiOperation({ summary: 'List all posts with pagination' })
    @ApiResponse({ status: 200, description: 'Return paginated posts' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'tag', required: false })
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
                // Ignore invalid token
            }
        }

        return this.client.send('find_all_posts', { ...paginationDto, userId, followingIds });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a post by ID' })
    @ApiResponse({ status: 200, description: 'Return single post' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    findOne(@Param('id') id: string) {
        return this.client.send('find_one_post', id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id') // Using Post for update
    @ApiOperation({ summary: 'Update a post' })
    @ApiResponse({ status: 200, description: 'Post updated' })
    async update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Request() req) {
        dto.id = id;
        dto.userId = req.user.userId;
        return this.client.send('update_post', dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a post' })
    @ApiResponse({ status: 200, description: 'Post deleted' })
    remove(@Param('id') id: string, @Request() req) {
        return this.client.send('remove_post', { id, userId: req.user.userId });
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/comments')
    @ApiOperation({ summary: 'Add a comment to a post' })
    @ApiResponse({ status: 201, description: 'Comment added' })
    async addComment(@Param('id') id: string, @Body() dto: CreateCommentDto, @Request() req) {
        dto.postId = id;
        dto.userId = req.user.userId;
        const comment = await this.client.send('add_comment', dto).toPromise();

        // Notification handled by PostService
        return comment;
    }

    @Get(':id/comments')
    @ApiOperation({ summary: 'Get comments for a post' })
    @ApiResponse({ status: 200, description: 'Return comments' })
    findComments(@Param('id') id: string, @Query() paginationDto: PaginationDto) {
        return this.client.send('find_comments', { postId: id, pagination: paginationDto });
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/likes')
    @ApiOperation({ summary: 'Toggle like on a post' })
    @ApiResponse({ status: 201, description: 'Like toggled' })
    async toggleLike(@Param('id') id: string, @Request() req) {
        const result = await this.client.send('toggle_like', { postId: id, userId: req.user.userId }).toPromise();

        // Notification handled by PostService
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/shares')
    @ApiOperation({ summary: 'Share a post' })
    @ApiResponse({ status: 201, description: 'Post shared' })
    async sharePost(@Param('id') id: string, @Body() dto: CreateShareDto, @Request() req) { // Changed to use DTO
        dto.postId = id;
        dto.userId = req.user.userId;
        return this.client.send('share_post', dto);
    }
}
