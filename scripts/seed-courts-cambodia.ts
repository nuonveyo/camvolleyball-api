import { DataSource } from 'typeorm';
import * as entities from '../libs/common/src/database/entities';
import * as dotenv from 'dotenv';
dotenv.config();

// Destructure for easier usage
const { Court, CourtAvailability, User } = entities;

// Mock data for courts
const courtsData = [
    {
        name: "National Olympic Stadium Volleyball Complex",
        description: "The premier indoor volleyball venue in Cambodia, hosting national leagues and major tournaments. Features seating for 8,000 spectators.",
        images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Olympic_Stadium_Phnom_Penh.jpg/1200px-Olympic_Stadium_Phnom_Penh.jpg"],
        addressDetail: "Charles de Gaulle Blvd (217), Phnom Penh",
        city: "Phnom Penh",
        country: "Cambodia",
        numberOfPitches: 2,
        rating: 5,
        bookingTypes: ['fixed', 'on_demand'],
        pricingPolicy: {
            on_demand: { price: 5.00, currency: "USD" },
            fixed: { price_per_hour: 20.00, currency: "USD" }
        },
        availabilities: [
            { dayOfWeek: 0, openTime: '06:00:00', closeTime: '21:00:00', isClosed: false },
            { dayOfWeek: 1, openTime: '06:00:00', closeTime: '21:00:00', isClosed: false },
            { dayOfWeek: 2, openTime: '06:00:00', closeTime: '21:00:00', isClosed: false },
            { dayOfWeek: 3, openTime: '06:00:00', closeTime: '21:00:00', isClosed: false },
            { dayOfWeek: 4, openTime: '06:00:00', closeTime: '21:00:00', isClosed: false },
            { dayOfWeek: 5, openTime: '06:00:00', closeTime: '21:00:00', isClosed: false },
            { dayOfWeek: 6, openTime: '06:00:00', closeTime: '21:00:00', isClosed: false }
        ]
    },
    {
        name: "Cambodian Country Club (CCC)",
        description: "Features a 400-square-meter sand field ideal for beach volleyball and other sports. Offers a relaxed atmosphere with full amenities.",
        images: ["https://www.cambodian-country-club.com/wp-content/uploads/2019/08/sport-facilities-banner.jpg"],
        addressDetail: "Street 2004, Phnom Penh",
        city: "Phnom Penh",
        country: "Cambodia",
        numberOfPitches: 1,
        rating: 4,
        bookingTypes: ['fixed'],
        pricingPolicy: {
            fixed: { price_per_hour: 15.00, currency: "USD" }
        },
        availabilities: [
            { dayOfWeek: 0, openTime: '07:00:00', closeTime: '22:00:00', isClosed: false },
            { dayOfWeek: 1, openTime: '07:00:00', closeTime: '22:00:00', isClosed: false },
            { dayOfWeek: 2, openTime: '07:00:00', closeTime: '22:00:00', isClosed: false },
            { dayOfWeek: 3, openTime: '07:00:00', closeTime: '22:00:00', isClosed: false },
            { dayOfWeek: 4, openTime: '07:00:00', closeTime: '22:00:00', isClosed: false },
            { dayOfWeek: 5, openTime: '07:00:00', closeTime: '22:00:00', isClosed: false },
            { dayOfWeek: 6, openTime: '07:00:00', closeTime: '22:00:00', isClosed: false }
        ]
    },
    {
        name: "CamEd Volleyball Club",
        description: "Home to a vibrant volleyball community with regular training sessions and social events. Great for meeting other players.",
        images: ["https://web.cam-ed.edu.kh/wp-content/uploads/2023/10/volleyball-club-1.jpg"],
        addressDetail: "No. 64 Street 108, Phnom Penh",
        city: "Phnom Penh",
        country: "Cambodia",
        numberOfPitches: 1,
        rating: 4,
        bookingTypes: ['on_demand', 'set'],
        pricingPolicy: {
            on_demand: { price: 3.00, currency: "USD" },
            set: { price_per_set: 2.00, currency: "USD" }
        },
        availabilities: [
            { dayOfWeek: 0, openTime: '08:00:00', closeTime: '20:00:00', isClosed: false },
            { dayOfWeek: 1, openTime: '08:00:00', closeTime: '20:00:00', isClosed: false },
            { dayOfWeek: 2, openTime: '08:00:00', closeTime: '20:00:00', isClosed: false },
            { dayOfWeek: 3, openTime: '08:00:00', closeTime: '20:00:00', isClosed: false },
            { dayOfWeek: 4, openTime: '08:00:00', closeTime: '20:00:00', isClosed: false },
            { dayOfWeek: 5, openTime: '08:00:00', closeTime: '20:00:00', isClosed: false },
            { dayOfWeek: 6, openTime: '17:00:00', closeTime: '20:00:00', isClosed: false } // Only evening on Sat for example
        ]
    },
    {
        name: "Siem Reap Spikers Home Court",
        description: "Official training ground for the Siem Reap Spikers. Good quality indoor flooring.",
        images: ["https://example.com/placeholder-sr-spikers.jpg"], // Placeholder if no real img
        addressDetail: "Near Road 60m, Siem Reap",
        city: "Siem Reap",
        country: "Cambodia",
        numberOfPitches: 1,
        rating: 4,
        bookingTypes: ['fixed'],
        pricingPolicy: {
            fixed: { price_per_hour: 10.00, currency: "USD" }
        },
        availabilities: [
            { dayOfWeek: 0, openTime: '09:00:00', closeTime: '18:00:00', isClosed: false },
            { dayOfWeek: 1, openTime: '09:00:00', closeTime: '18:00:00', isClosed: false },
            { dayOfWeek: 2, openTime: '09:00:00', closeTime: '18:00:00', isClosed: false },
            { dayOfWeek: 3, openTime: '09:00:00', closeTime: '18:00:00', isClosed: false },
            { dayOfWeek: 4, openTime: '09:00:00', closeTime: '18:00:00', isClosed: false },
            { dayOfWeek: 5, openTime: '09:00:00', closeTime: '21:00:00', isClosed: false },
            { dayOfWeek: 6, openTime: '09:00:00', closeTime: '21:00:00', isClosed: false }
        ]
    },
    {
        name: "Sok San Beach Volleyball",
        description: "Beach volleyball court located at the beautiful Sok San Beach Resort. Perfect for casual play with ocean views.",
        images: ["https://media-cdn.tripadvisor.com/media/photo-s/0e/9c/58/05/volleyball.jpg"],
        addressDetail: "Sok San Beach, Koh Rong",
        city: "Sihanoukville",
        country: "Cambodia",
        numberOfPitches: 2,
        rating: 5,
        bookingTypes: ['on_demand'],
        pricingPolicy: {
            on_demand: { price: 0.00, currency: "USD" } // Maybe free for guests
        },
        availabilities: [
            { dayOfWeek: 0, openTime: '08:00:00', closeTime: '18:00:00', isClosed: false },
            { dayOfWeek: 1, openTime: '08:00:00', closeTime: '18:00:00', isClosed: false },
            { dayOfWeek: 2, openTime: '08:00:00', closeTime: '18:00:00', isClosed: false },
            { dayOfWeek: 3, openTime: '08:00:00', closeTime: '18:00:00', isClosed: false },
            { dayOfWeek: 4, openTime: '08:00:00', closeTime: '18:00:00', isClosed: false },
            { dayOfWeek: 5, openTime: '08:00:00', closeTime: '18:00:00', isClosed: false },
            { dayOfWeek: 6, openTime: '08:00:00', closeTime: '18:00:00', isClosed: false }
        ]
    }
];

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5433', 10),
    username: process.env.DATABASE_USER || 'admin',
    password: process.env.DATABASE_PASSWORD || 'password123',
    database: process.env.DATABASE_NAME || 'camvolleyball_db',
    entities: Object.values(entities).filter(entity => typeof entity === 'function'),
    synchronize: false,
});

async function seed() {
    await dataSource.initialize();
    console.log('Database connected');

    const courtRepository = dataSource.getRepository(Court);
    const availRepository = dataSource.getRepository(CourtAvailability);
    const userRepository = dataSource.getRepository(User);

    // Find a default owner (admin) or create one
    // For simplicity, we just grab the first user or create a placeholder if none
    let owner = await userRepository.findOne({ where: {} });
    if (!owner) {
        console.warn('No users found. Cannot assign owner. Skipping. Please create a user first.');
        // In a real scenario we might create one, but let's assume one exists or we just fail gracefully
        // Or we can create a dummy user
    }

    if (owner) {
        for (const data of courtsData) {
            const { availabilities, ...courtDetails } = data;

            let court = await courtRepository.findOne({ where: { name: courtDetails.name } });

            if (!court) {
                court = courtRepository.create({
                    ...courtDetails,
                    ownerId: owner.id
                });
                await courtRepository.save(court);
                console.log(`Created court: ${court.name}`);

                // Create availabilities
                for (const avail of availabilities) {
                    const availability = availRepository.create({
                        ...avail,
                        courtId: court.id
                    });
                    await availRepository.save(availability);
                }
                console.log(`  Added availabilities for ${court.name}`);

            } else {
                console.log(`Skipping (exists): ${court.name}`);
                // Optional: update logic here if needed
            }
        }
    }

    await dataSource.destroy();
    console.log('Done');
}

seed().catch((err) => {
    console.error('Error seeding courts:', err);
    process.exit(1);
});
