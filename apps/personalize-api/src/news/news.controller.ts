import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(@Query() query: { page?: any, limit?: any }) {
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 20;
        return this.newsService.findAll(page, limit);
    }

    // Likely admin only in real app, but leaving public/protected for MVP demo
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create news manually (or via scraper)' })
    create(@Body() dto: CreateNewsDto) {
        return this.newsService.create(dto);
    }
}
