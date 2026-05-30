const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(
  process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_ADS_CLIENT_SECRET,
  'http://localhost:3000/oauth/callback'
);

async function getRefreshToken() {
  const { tokens } = await client.getToken('4/0AeoWuM9h7wDae9jx8FnDTOMPcEET13AcsOV2ZBWWdao1D7GW1wyoDCaz9UQEo9T8J2xcmw');
  console.log('\n✅ Refresh Token:\n');
  console.log(tokens.refresh_token);
}

getRefreshToken().catch(console.error);
