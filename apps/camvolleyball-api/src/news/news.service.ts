import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '@app/common';
import { CreateNewsDto } from './dto/create-news.dto';

@Injectable()
export class NewsService {
    constructor(
        @InjectRepository(News)
        private newsRepository: Repository<News>,
    ) { }

    async findAll() {
        return this.newsRepository.find({
            order: { createdAt: 'DESC' },
            take: 20,
        });
    }

    async create(dto: CreateNewsDto) {
        // Simple create for now, mostly used by scraper
        const news = this.newsRepository.create(dto);
        return this.newsRepository.save(news);
    }

    // Placeholder for scraping logic (to be triggered via cron or admin endpoint)
    async scrapeNews() {
        // Implementation for scraping would go here
        // e.g. using puppeteer or axios/cheerio
        return { message: 'Scraping started' };
    }
}
