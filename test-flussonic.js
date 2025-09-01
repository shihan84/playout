const https = require('https');

// Test configuration
const config = {
  host: 'cdn.itassist.one',
  port: 443,
  username: 'admin',
  password: 'ad@min1991',
  endpoint: '/api/v1/server/status'
};

// Create basic auth header
const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

const options = {
  hostname: config.host,
  port: config.port,
  path: config.endpoint,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Flussonic-Test/1.0'
  },
  timeout: 10000
};

console.log(`Testing connection to: https://${config.host}:${config.port}${config.endpoint}`);

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Status Message: ${res.statusMessage}`);
  console.log('Headers:', res.headers);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Response Data:', JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.on('timeout', () => {
  console.error('Request timed out');
  req.destroy();
});

req.end();