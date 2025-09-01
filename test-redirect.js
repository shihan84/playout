const https = require('https');
const http = require('http');

// Test configuration
const config = {
  host: 'cdn.itassist.one',
  port: 443,
  username: 'admin',
  password: 'ad@min1991'
};

// Create basic auth header
const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

function testRootEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.host,
      port: config.port,
      path: '/',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Flussonic-Test/1.0'
      },
      timeout: 10000
    };

    console.log(`Testing: https://${config.host}:${config.port}/`);

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
      console.log('Headers:', res.headers);
      
      if (res.statusCode === 302 && res.headers.location) {
        console.log(`Redirecting to: ${res.headers.location}`);
        const redirectUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : `https://${config.host}:${config.port}${res.headers.location}`;
        testRedirect(redirectUrl).then(resolve).catch(reject);
      } else {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          resolve({
            endpoint: '/',
            status: res.statusCode,
            message: res.statusMessage,
            headers: res.headers,
            data: data
          });
        });
      }
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.end();
  });
}

function testRedirect(redirectUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(redirectUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Flussonic-Test/1.0'
      },
      timeout: 10000
    };

    console.log(`Following redirect to: ${redirectUrl}`);

    const req = client.request(options, (res) => {
      console.log(`Redirect Status: ${res.statusCode} ${res.statusMessage}`);
      console.log('Redirect Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          endpoint: redirectUrl,
          status: res.statusCode,
          message: res.statusMessage,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.end();
  });
}

testRootEndpoint()
  .then(result => {
    console.log('\n=== Final Result ===');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(console.error);