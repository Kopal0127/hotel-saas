const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(
  process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_ADS_CLIENT_SECRET,
  'http://localhost:3000/oauth/callback'
);

const url = client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/adwords'],
});

console.log('\n✅ Is URL pe browser mein jaao:\n');
console.log(url);
