import { DataSource } from 'typeorm';
import * as entities from '../libs/common/src/database/entities';
import { Sector } from '../libs/common/src/database/enums/sector.enum';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Destructure for easy usage
const { Venue, VenueAvailability, User } = entities;

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Define venues without generic availabilities since we generate dates
const venuesData = [
    {
        name: "National Olympic Stadium Volleyball Complex",
        description: "The premier indoor volleyball venue in Cambodia, hosting national leagues and major tournaments. Features seating for 8,000 spectators.",
        images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Olympic_Stadium_Phnom_Penh.jpg/1200px-Olympic_Stadium_Phnom_Penh.jpg"],
        addressDetail: "Charles de Gaulle Blvd (217), Phnom Penh",
        city: "Phnom Penh",
        country: "Cambodia",
        latitude: 11.5583,
        longitude: 104.9119,
        rating: 5,
        phoneNumber: "+855 23 215 869",
        sector: Sector.SPORTS,
        metadata: {
            sportType: "volleyball",
            numberOfPitches: 2,
            bookingTypes: ['fixed', 'on_demand'],
            pricingPolicy: {
                on_demand: { price: 5.00, currency: "USD" },
                fixed: { price_per_hour: 20.00, currency: "USD" }
            }
        }
    },
    {
        name: "Cambodian Country Club (CCC)",
        description: "Features a 400-square-meter sand field ideal for beach volleyball and other sports. Offers a relaxed atmosphere with full amenities.",
        images: ["https://www.cambodian-country-club.com/wp-content/uploads/2019/08/sport-facilities-banner.jpg"],
        addressDetail: "Street 2004, Group 6, Sangkat Toeuk Thla, Khan Sen Sok, Phnom Penh",
        city: "Phnom Penh",
        country: "Cambodia",
        latitude: 11.5625,
        longitude: 104.9160,
        rating: 4,
        phoneNumber: "+855 70 88 55 91",
        sector: Sector.SPORTS,
        metadata: {
            sportType: "volleyball",
            numberOfPitches: 1,
            bookingTypes: ['fixed'],
            pricingPolicy: {
                fixed: { price_per_hour: 15.00, currency: "USD" }
            }
        }
    },
    {
        name: "Central Park Sports Complex",
        description: "Modern sports complex featuring covered volleyball courts, protecting players from the sun and rain.",
        images: ["https://fastly.4sqi.net/img/general/600x600/54266143_...jpg"],
        addressDetail: "Street R1, Boeung Kak, Tuol Kork, Phnom Penh",
        city: "Phnom Penh",
        country: "Cambodia",
        latitude: 11.57982,
        longitude: 104.91063,
        rating: 4,
        phoneNumber: "089 787 888",
        sector: Sector.SPORTS,
        metadata: {
            sportType: "volleyball",
            numberOfPitches: 2,
            bookingTypes: ['fixed'],
            pricingPolicy: {
                fixed: { price_per_hour: 12.00, currency: "USD" }
            }
        }
    },
    {
        name: "Siem Reap Spikers Home Court",
        description: "Official training ground for the Siem Reap Spikers. Good quality indoor flooring.",
        images: [],
        addressDetail: "Near Road 60m, Siem Reap",
        city: "Siem Reap",
        country: "Cambodia",
        latitude: 13.3633, // Approx for Siem Reap
        longitude: 103.8564,
        rating: 4,
        sector: Sector.SPORTS,
        metadata: {
            sportType: "volleyball",
            numberOfPitches: 1,
            bookingTypes: ['fixed'],
            pricingPolicy: {
                fixed: { price_per_hour: 10.00, currency: "USD" }
            }
        }
    },
    {
        name: "Sok San Beach Volleyball",
        description: "Beach volleyball court located at the beautiful Sok San Beach Resort. Perfect for casual play with ocean views.",
        images: ["https://media-cdn.tripadvisor.com/media/photo-s/0e/9c/58/05/volleyball.jpg"],
        addressDetail: "Sok San Beach, Koh Rong",
        city: "Sihanoukville",
        country: "Cambodia",
        latitude: 10.6765, // Approx for Koh Rong
        longitude: 103.2750,
        rating: 5,
        sector: Sector.SPORTS,
        metadata: {
            sportType: "volleyball",
            numberOfPitches: 2,
            bookingTypes: ['on_demand'],
            pricingPolicy: {
                on_demand: { price: 0.00, currency: "USD" }
            }
        }
    }
];

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
    username: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'password123',
    database: process.env.POSTGRES_DB || 'personalize_db',
    entities: Object.values(entities).filter(entity => typeof entity === 'function'),
    synchronize: false,
});

async function seed() {
    await dataSource.initialize();
    console.log('Database connected to:', dataSource.options.database);

    const venueRepository = dataSource.getRepository(Venue);
    const availRepository = dataSource.getRepository(VenueAvailability);
    const userRepository = dataSource.getRepository(User);

    // Find a default owner (admin) or create one
    let owner = await userRepository.findOne({ where: {} });

    if (!owner) {
        console.warn('No users found. Creating a dummy admin user for ownership...');
        owner = userRepository.create({
            phoneNumber: '+85500000000',
            passwordHash: 'hashed_placeholder',
            isActive: true
        });
        await userRepository.save(owner);
        console.log('Created dummy admin user');
    }

    console.log(`Assigning venues to Owner ID: ${owner.id}`);

    for (const data of venuesData) {
        // Create or update venue
        let venue = await venueRepository.findOne({ where: { name: data.name } });

        if (!venue) {
            venue = venueRepository.create({
                ...data,
                ownerId: owner.id
            });
            await venueRepository.save(venue);
            console.log(`Created venue: ${venue.name}`);

            // Generate Schema-Compliant Availabilities (Date-based)
            const today = new Date();
            // Generate for next 7 days
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);

                const availability = availRepository.create({
                    venue: venue, // Use relation object
                    date: date,
                    startTime: '08:00:00',
                    endTime: '22:00:00',
                    is_available: true
                    // price_override omitted (undefined)
                });
                await availRepository.save(availability);
            }
            console.log(`  Added 7-day availabilities for ${venue.name}`);

        } else {
            console.log(`Skipping (exists): ${venue.name}`);
            // Optional: Update metadata if needed
            venue.sector = Sector.SPORTS;
            venue.metadata = { ...venue.metadata, sportType: 'volleyball' };
            venue.latitude = data.latitude;
            venue.longitude = data.longitude;
            await venueRepository.save(venue);
            console.log(`  Updated metadata/coords for ${venue.name}`);
        }
    }

    await dataSource.destroy();
    console.log('Seeding completed successfully');
}

seed().catch((err) => {
    console.error('Error seeding venues:', err);
    process.exit(1);
});
