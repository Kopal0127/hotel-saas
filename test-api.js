const { GoogleAdsApi } = require('google-ads-api');
require('dotenv').config();

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

async function test() {
  const customer = client.Customer({
    customer_id: '2607568211',
    login_customer_id: '2607568211',
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  });

  const campaigns = await customer.query('SELECT campaign.id, campaign.name, campaign.status FROM campaign LIMIT 5');
  console.log('Connected! Campaigns:');
  console.log(campaigns);
}

test().catch(console.error);