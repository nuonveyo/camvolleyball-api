const jwt = require('jsonwebtoken');
const axios = require('axios');
const https = require('https');

const secret = 'supersecretkey';
const userId = '0f3b98da-d9a9-4511-b52e-3b50e97c12ae'; // yoyo, sports
const payload = { sub: userId };
const token = jwt.sign(payload, secret);

const agent = new https.Agent({
    rejectUnauthorized: false
});

const random = Math.random();
const url = `https://localhost:3000/personalize/v1/posts?page=1&limit=10&t=${random}`;

console.log('Fetching:', url);

axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    httpsAgent: agent
})
    .then(res => {
        console.log('Status:', res.status);
        // Response structure: { message: "success", data: { data: [...], total: ... } }
        const responseBody = res.data;
        if (responseBody.data && responseBody.data.data) {
            console.log('Total:', responseBody.data.total);
            console.log('Posts:', responseBody.data.data.map(p => ({ id: p.id, sector: p.sector, visibility: p.visibility })));
        } else {
            console.log('Unexpected structure:', responseBody);
        }
    })
    .catch(err => {
        console.error('Error:', err.message);
        if (err.response) console.error(err.response.data);
    });
