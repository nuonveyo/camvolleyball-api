const axios = require('axios');

async function main() {
    const phone = '+85510767341';
    console.log(`Sending OTP to ${phone}...`);

    try {
        const res = await axios.post('http://localhost:3000/camvolleyball/v1/auth/otp/send', {
            phoneNumber: phone,
            type: 'verification' // Updated to match Enum
        });
        console.log('Response:', res.data);
    } catch (e) {
        console.error('Failed:', e.response?.data || e.message);
    }
}
main();
