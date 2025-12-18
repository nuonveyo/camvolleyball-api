import { DataSource } from 'typeorm';
import { News } from '../libs/common/src/database/entities/news.entity';
import * as dotenv from 'dotenv';
dotenv.config();

const newsData = [
    {
        title: "Perugia and Praia Clube Start World Club Championship With Straight-Sets Wins",
        thumbnailUrl: "https://worldofvolley.com/wp-content/uploads/2025/12/Perugia-vs-Swehly.jpg",
        originalUrl: "https://worldofvolley.com/Latest_News/Italy",
        newsUrl: "https://worldofvolley.com/latest_news/fivb/333438/perugia-and-praia-clube-start-world-club-championship-with-straight-sets-wins.html",
        sourceName: "WorldofVolley",
        isVisible: true,
        description: "Sir Sicoma Monini Perugia began their FIVB Volleyball Men’s Club World Championship campaign with a straight-sets victory.",
        postDate: new Date('2025-12-17T10:00:00Z'),
    },
    {
        title: "ITA M: Trentino claim SuperLega winter title",
        thumbnailUrl: "https://worldofvolley.com/wp-content/uploads/2025/12/Trentino-1-scaled.jpg",
        originalUrl: "https://worldofvolley.com/Latest_News/Italy",
        newsUrl: "https://worldofvolley.com/latest_news/italy/333417/ita-m-trentino-claim-superlega-winter-title.html",
        sourceName: "WorldofVolley",
        isVisible: true,
        description: "Itas Trentino finished the first half of the SuperLega Credem Banca season as “winter champions” after a commanding performance.",
        postDate: new Date('2025-12-16T14:30:00Z'),
    },
    {
        title: "ITA W: Three Tie-Break Matches Mark Latest Round",
        thumbnailUrl: "https://worldofvolley.com/wp-content/uploads/2025/12/Bergamo-vs-Numia-Vero-Volley-Milano-.jpeg",
        originalUrl: "https://worldofvolley.com/Latest_News/Italy",
        newsUrl: "https://worldofvolley.com/latest_news/italy/333414/ita-w-three-tie-break-matches-mark-latest-round.html",
        sourceName: "WorldofVolley",
        isVisible: true,
        description: "The A1 Tigotà 14th round produced several close contests, with three matches decided in dramatic tie-breaks.",
        postDate: new Date('2025-12-15T18:00:00Z'),
    },
    {
        title: "FIVB WCC W: Scandicci claim Club World Championship title",
        thumbnailUrl: "https://worldofvolley.com/wp-content/uploads/2025/12/Scandicci.jpg",
        originalUrl: "https://worldofvolley.com/Latest_News/Italy",
        newsUrl: "https://worldofvolley.com/latest_news/fivb/333408/fivb-wcc-w-scandicci-claim-club-world-championship-title.html",
        sourceName: "WorldofVolley",
        isVisible: true,
        description: "Savino Del Bene Scandicci captured their first FIVB Women’s Club World Championship, defeating defending champions in a thriller.",
        postDate: new Date('2025-12-14T20:15:00Z'),
    },
    {
        title: "Trentino and Berlin Open Champions League With Straight-Set Wins",
        thumbnailUrl: "https://worldofvolley.com/wp-content/uploads/2025/12/Trentino-vs-ACH-Volley.jpeg",
        originalUrl: "https://worldofvolley.com/Latest_News/Italy",
        newsUrl: "https://worldofvolley.com/latest_news/cev/333404/trentino-and-berlin-open-champions-league-with-straight-set-wins.html",
        sourceName: "WorldofVolley",
        isVisible: true,
        description: "Trentino Itas and the Berlin Recycling Volleys opened their CEV Champions League campaigns with dominant straight-set wins.",
        postDate: new Date('2025-12-13T09:00:00Z'),
    }
];

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5433', 10),
    username: process.env.DATABASE_USER || 'admin',
    password: process.env.DATABASE_PASSWORD || 'password123',
    database: process.env.DATABASE_NAME || 'camvolleyball_db',
    entities: [News],
    synchronize: false,
});

async function seed() {
    await dataSource.initialize();
    console.log('Database connected');

    const newsRepository = dataSource.getRepository(News);

    for (const item of newsData) {
        const existing = await newsRepository.findOne({ where: { title: item.title } });
        if (existing) {
            Object.assign(existing, item);
            await newsRepository.save(existing);
            console.log(`Updated news: ${item.title}`);
        } else {
            await newsRepository.save(item);
            console.log(`Saved news: ${item.title}`);
        }
    }

    await dataSource.destroy();
    console.log('Done');
}

seed().catch((err) => {
    console.error('Error seeding news:', err);
    process.exit(1);
});
