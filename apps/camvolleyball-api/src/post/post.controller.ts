import { Controller, Get, Post, Body, Put, Param, Delete, Inject, UseGuards, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreatePostDto, UpdatePostDto } from '@app/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostController {
    constructor(@Inject('POST_SERVICE') private client: ClientProxy) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreatePostDto, @Request() req) {
        dto.userId = req.user.userId;
        return this.client.send('create_post', dto);
    }

    @Get() // Public? Or Authenticated? Let's make it public for feed
    findAll() {
        return this.client.send('find_all_posts', {});
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.client.send('find_one_post', id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id') // Using Put for update
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
}
