const io = require('socket.io-client');
const axios = require('axios');

async function main() {
    // User requested format: +85510767341
    // Country: +855, Prefix: 10, Suffix: 6 digits
    // We generate random 6 digits for suffix to ensure uniqueness
    const randomSuffixA = Math.floor(100000 + Math.random() * 900000);
    const randomSuffixB = Math.floor(100000 + Math.random() * 900000);

    // Ensure B is different from A
    // If they collide (unlikely), B will be A + 1

    const phoneA = `+85510${randomSuffixA}`;
    const phoneB = `+85510${randomSuffixB}`;

    console.log(`User A: ${phoneA}`);
    console.log(`User B: ${phoneB}`);

    console.log('--- Registering Users ---');
    // Register User A
    try {
        await axios.post('http://localhost:3000/camvolleyball/v1/auth/register', { phoneNumber: phoneA, password: 'password', confirmPassword: 'password' });
    } catch (e) {
        console.error('Register A Failed:', e.response?.data || e.message);
        process.exit(1);
    }
    const loginA = await axios.post('http://localhost:3000/camvolleyball/v1/auth/login', { phoneNumber: phoneA, password: 'password' });
    const tokenA = loginA.data.data.access_token;

    // Get ID A
    const profileA = await axios.get('http://localhost:3000/camvolleyball/v1/profile', { headers: { Authorization: `Bearer ${tokenA}` } });
    console.log('Profile Response:', JSON.stringify(profileA.data, null, 2));

    // Response wrapped in { data: { user: { id: ... } } }
    const idA = profileA.data.data.user.id;
    console.log(`User A (Recipient) ID: ${idA}`);

    if (!idA) {
        console.error('Failed to get User A ID');
        process.exit(1);
    }

    // Register User B
    try {
        await axios.post('http://localhost:3000/camvolleyball/v1/auth/register', { phoneNumber: phoneB, password: 'password', confirmPassword: 'password' });
    } catch (e) {
        console.error('Register B Failed:', e.response?.data || e.message);
        process.exit(1);
    }
    const loginB = await axios.post('http://localhost:3000/camvolleyball/v1/auth/login', { phoneNumber: phoneB, password: 'password' });
    const tokenB = loginB.data.data.access_token;
    console.log(`User B (Actor) Registered`);


    console.log('--- Connecting User A to WebSocket ---');
    const socket = io('http://localhost:3003', {
        query: { token: tokenA },
    });

    socket.on('connect', () => {
        console.log('User A connected to WebSocket');

        // Trigger Action: B follows A
        console.log('--- User B follows User A ---');
        // Wait a bit to ensure socket connection is registered on server
        setTimeout(() => {
            axios.post(`http://localhost:3000/camvolleyball/v1/social/follow/${idA}`, {}, { headers: { Authorization: `Bearer ${tokenB}` } })
                .then(res => console.log('Follow request sent'))
                .catch(err => console.error('Follow failed', err.response?.data || err.message));
        }, 1000);

    });

    socket.on('notification', (data) => {
        console.log('--- RECEIVED NOTIFICATION ---');
        console.log(data);
        if (data.type === 'FOLLOW' && data.actorId) {
            console.log('SUCCESS: Notification verified');
            process.exit(0);
        }
    });

    socket.on('disconnect', () => console.log('Disconnected'));

    // Timeout
    setTimeout(() => {
        console.log('Timeout - No notification received');
        process.exit(1);
    }, 15000);
}

main().catch(err => console.error(err));
