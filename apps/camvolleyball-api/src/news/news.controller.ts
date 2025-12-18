import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('News')
@ApiBearerAuth()
@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService) { }

    @Get()
    @ApiOperation({ summary: 'Get latest news' })
    @ApiResponse({ status: 200, description: 'List of news articles' })
    findAll() {
        return this.newsService.findAll();
    }

    // Likely admin only in real app, but leaving public/protected for MVP demo
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create news manually (or via scraper)' })
    create(@Body() dto: CreateNewsDto) {
        return this.newsService.create(dto);
    }
}
