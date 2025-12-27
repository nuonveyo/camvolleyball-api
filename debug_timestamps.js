const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });
const API_URL = 'https://localhost:3000/personalize/v1/posts'; // Using HTTPS

async function checkTimestamps() {
    try {
        console.log('Fetching Public Feed (Guest)...');
        // Assuming /personalize/v1/posts works without token for public
        const response = await axios.get(`${API_URL}?limit=5`, { httpsAgent: agent });

        console.log('Raw Response Data Type:', typeof response.data);
        console.log('Raw Response Data keys:', Object.keys(response.data));

        const posts = response.data.data || response.data;

        if (!Array.isArray(posts)) {
            console.error('Posts is not an array:', posts);
            return;
        }

        console.log('--- Top 5 Posts in Feed ---');
        posts.forEach((post, index) => {
            console.log(`#${index + 1} ID: ${post.id}`);
            console.log(`   CreatedAt: ${post.createdAt}`);
            console.log(`   Sector: ${post.sector}`);
        });

        const now = new Date();
        console.log('\n--- Current System Time ---');
        console.log(`Now (UTC): ${now.toISOString()}`);

        if (posts.length > 0) {
            const topPostDate = new Date(posts[0].createdAt);
            const diff = topPostDate - now;
            const diffHours = diff / (1000 * 60 * 60);

            if (diff > 0) {
                console.log(`\n[WARNING] The top post is in the FUTURE by ${diffHours.toFixed(2)} hours!`);
                console.log('This confirms that old data has "Future Timestamps" which Buries new "Correct" posts.');
            } else {
                console.log(`\n[INFO] Top post is in the past (${Math.abs(diffHours).toFixed(2)} hours ago).`);
            }
        }

    } catch (error) {
        console.error('Error fetching feed:', error.message);
        if (error.response) console.error('Data:', error.response.data);
    }
}

checkTimestamps();
