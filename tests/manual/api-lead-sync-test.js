// tester.js
const https = require('https');

const data = {
  full_name: "Test Lead",
  contact_email: "test@example.com",
  contact_phone: "555-0000",
  source: "Referral",
  stage: "New Lead",
  notes: "Manual test",
  priority: "High",
  vehicle_of_interest: "Cybertruck",
  trade_in_details: "None"
};

const options = {
  hostname: 'ghostcrm-liard.vercel.app',
  path: '/api/sync/lead',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(data))
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(JSON.stringify(data));
req.end();