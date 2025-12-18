import { DataSource } from 'typeorm';
import { News } from '../libs/common/src/database/entities/news.entity';
import * as dotenv from 'dotenv';
dotenv.config();

const newsData = [
    {
        title: "Men's Club World Championship 2025: Cruzeiro beat Swehly",
        thumbnailUrl: "https://images.volleyballworld.com/image/private/t_editorial_landscape_12_desktop/fivb-prd/lqzj8q9q9q9q9q9q9q9q.jpg", // Placeholder or valid URL
        originalUrl: "https://en.volleyballworld.com/",
        newsUrl: "https://en.volleyballworld.com/news/mens-club-world-championship-2025",
        sourceName: "Volleyball World",
        isVisible: true,
    },
    {
        title: "Warta Zawierce wins five-setter against Campinas",
        thumbnailUrl: "https://www.worldofvolley.com/wd/uploads/2025/12/warta.jpg", // Placeholder
        originalUrl: "https://www.worldofvolley.com/",
        newsUrl: "https://www.worldofvolley.com/Latest_News/Poland/3000/warta-wins.html",
        sourceName: "World of Volley",
        isVisible: true,
    },
    {
        title: "Trentino claims SuperLega winter title",
        thumbnailUrl: "https://www.worldofvolley.com/wd/uploads/2025/12/trentino.jpg",
        originalUrl: "https://www.worldofvolley.com/",
        newsUrl: "https://www.worldofvolley.com/Latest_News/Italy",
        sourceName: "World of Volley",
        isVisible: true,
    },
    {
        title: "LA28 Olympic Games qualification systems confirmed",
        thumbnailUrl: "https://www.fivb.com/img/fivb-logo.png",
        originalUrl: "https://www.fivb.com/",
        newsUrl: "https://www.fivb.com/en/about/news/la28-qualification",
        sourceName: "FIVB",
        isVisible: true,
    },
    {
        title: "Gabi named Best Volleyball Athlete of the Year",
        thumbnailUrl: "https://www.fivb.com/img/gabi.jpg",
        originalUrl: "https://www.fivb.com/",
        newsUrl: "https://www.fivb.com/en/news/gabi-athlete-year",
        sourceName: "FIVB",
        isVisible: true,
    }
];

// Database configuration (Simplified for script)
const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5433', 10),
    username: process.env.DATABASE_USER || 'admin',
    password: process.env.DATABASE_PASSWORD || 'password123',
    database: process.env.DATABASE_NAME || 'camvolleyball_db',
    entities: [News],
    synchronize: false, // Don't sync, just use existing
});

async function seed() {
    await dataSource.initialize();
    console.log('Database connected');

    const newsRepository = dataSource.getRepository(News);

    for (const item of newsData) {
        const existing = await newsRepository.findOne({ where: { title: item.title } });
        if (!existing) {
            await newsRepository.save(item);
            console.log(`Scoped news: ${item.title}`);
        } else {
            console.log(`Skipping (already exists): ${item.title}`);
        }
    }

    await dataSource.destroy();
    console.log('Done');
}

seed().catch((err) => {
    console.error('Error seeding news:', err);
    process.exit(1);
});
