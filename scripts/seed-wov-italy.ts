import { DataSource } from 'typeorm';
import { News } from '../libs/common/src/database/entities/news.entity';
import { SportType } from '../libs/common/src/database/enums/sport-type.enum';
import { Sector } from '../libs/common/src/database/enums/sector.enum';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const newsData = [
    {
        title: "FIVB WCC M: Perugia Upset Defending Champions Sada Cruzeiro in Pool B Clash",
        newsUrl: "https://worldofvolley.com/latest_news/fivb/333474/fivb-wcc-m-perugia-upset-defending-champions-sada-cruzeiro-in-pool-b-clash.html",
        thumbnailUrl: "https://worldofvolley.com/wp-content/themes/worldofvolley/images/logo.png", // Placeholder
        description: "Perugia made a statement in their Pool B clash by upsetting the defending champions Sada Cruzeiro in a thrilling match.",
    },
    {
        title: "FIVB WCC M: Vôlei Renata Win Brazilian Derby; Perugia Edge Osaka",
        newsUrl: "https://worldofvolley.com/latest_news/fivb/333449/fivb-wcc-m-volei-renata-win-brazilian-derby-perugia-edge-osaka.html",
        thumbnailUrl: "https://worldofvolley.com/wp-content/themes/worldofvolley/images/logo.png",
        description: "Vôlei Renata emerged victorious in the Brazilian derby, while Perugia secured a hard-fought win against Osaka.",
    },
    {
        title: "Perugia and Praia Clube Start World Club Championship With Straight-Sets Wins",
        newsUrl: "https://worldofvolley.com/latest_news/fivb/333438/perugia-and-praia-clube-start-world-club-championship-with-straight-sets-wins.html",
        thumbnailUrl: "https://worldofvolley.com/wp-content/themes/worldofvolley/images/logo.png",
        description: "Both Perugia and Praia Clube began their World Club Championship campaigns with dominant straight-sets victories.",
    },
    {
        title: "ITA M: Trentino claim SuperLega winter title",
        newsUrl: "https://worldofvolley.com/latest_news/italy/333417/ita-m-trentino-claim-superlega-winter-title.html",
        thumbnailUrl: "https://worldofvolley.com/wp-content/themes/worldofvolley/images/logo.png",
        description: "Trentino has clinched the SuperLega winter title, asserting their dominance in the first half of the season.",
    },
    {
        title: "ITA W: Three Tie-Break Matches Mark Latest Round",
        newsUrl: "https://worldofvolley.com/latest_news/italy/333414/ita-w-three-tie-break-matches-mark-latest-round.html",
        thumbnailUrl: "https://worldofvolley.com/wp-content/themes/worldofvolley/images/logo.png",
        description: "The latest round of the Italian Women's League was highlighted by three intense matches that went to tie-breaks.",
    },
    {
        title: "FIVB WCC W: Scandicci claim Club World Championship title",
        newsUrl: "https://worldofvolley.com/latest_news/fivb/333408/fivb-wcc-w-scandicci-claim-club-world-championship-title.html",
        thumbnailUrl: "https://worldofvolley.com/wp-content/themes/worldofvolley/images/logo.png",
        description: "Scandicci has made history by claiming the Women's Club World Championship title in a spectacular fashion.",
    },
    {
        title: "Trentino and Berlin Open Champions League With Straight-Set Wins",
        newsUrl: "https://worldofvolley.com/latest_news/cev/333404/trentino-and-berlin-open-champions-league-with-straight-set-wins.html",
        thumbnailUrl: "https://worldofvolley.com/wp-content/themes/worldofvolley/images/logo.png",
        description: "Trentino and Berlin started their Champions League journey strong, both securing wins in straight sets.",
    },
    {
        title: "FIVB WCC W: Conegliano Sweeps Praia to Top Pool B",
        newsUrl: "https://worldofvolley.com/latest_news/fivb/333397/fivb-wcc-w-conegliano-sweeps-praia-to-top-pool-b.html",
        thumbnailUrl: "https://worldofvolley.com/wp-content/themes/worldofvolley/images/logo.png",
        description: "Conegliano delivered a sweep against Praia to finish at the top of Pool B in the Women's Club World Championship.",
    },
    {
        title: "FIVB WCC W: Scandicci Advances to Semifinals with Sweep of Osasco",
        newsUrl: "https://worldofvolley.com/latest_news/fivb/333394/fivb-wcc-w-scandicci-advances-to-semifinals-with-sweep-of-osasco.html",
        thumbnailUrl: "https://worldofvolley.com/wp-content/themes/worldofvolley/images/logo.png",
        description: "Scandicci advanced to the semifinals after a convincing sweep of Osasco.",
    },
    {
        title: "ITA W: Novara Beats Monviso in Four Sets",
        newsUrl: "https://worldofvolley.com/latest_news/italy/333391/ita-w-novara-beats-monviso-in-four-sets.html",
        thumbnailUrl: "https://worldofvolley.com/wp-content/themes/worldofvolley/images/logo.png",
        description: "Novara secured a victory against Monviso, closing out the match in four sets.",
    }
];

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
    username: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'password123',
    database: process.env.POSTGRES_DB || 'personalize_db',
    entities: [News],
    synchronize: false,
});

async function seed() {
    await dataSource.initialize();
    console.log('Database connected to:', dataSource.options.database);

    const newsRepository = dataSource.getRepository(News);

    for (const item of newsData) {
        const existing = await newsRepository.findOne({ where: { newsUrl: item.newsUrl } });

        const newsItem = existing || new News();
        newsItem.title = item.title;
        newsItem.newsUrl = item.newsUrl;
        newsItem.originalUrl = "https://worldofvolley.com/Latest_News/Italy";
        newsItem.thumbnailUrl = item.thumbnailUrl;
        newsItem.description = item.description;
        newsItem.sourceName = "WorldofVolley";
        newsItem.sector = Sector.SPORTS;
        newsItem.sportType = SportType.VOLLEYBALL;
        newsItem.isVisible = true;
        newsItem.postDate = new Date();

        await newsRepository.save(newsItem);
        console.log(`${existing ? 'Updated' : 'Saved'} news: ${item.title}`);
    }

    await dataSource.destroy();
    console.log('Seed completed.');
}

seed().catch((err) => {
    console.error('Error seeding news:', err);
    process.exit(1);
});
