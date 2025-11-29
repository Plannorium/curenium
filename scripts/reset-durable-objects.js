const https = require('https');

// Worker URL and auth key
const WORKER_URL = 'https://curenium-chat.almussanplanner12.workers.dev';
const AUTH_KEY = '58vZ7T4yt8zZSiTJAgZZnoGWwFNgCFp1tgA/nY/jr5u=';

// Function to make HTTPS request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Reset a specific Durable Object room
async function resetRoom(roomId) {
  try {
    // Use the same routing as the WebSocket connections - add room as query param
    const url = `${WORKER_URL}/api/chat/socket?room=${roomId}&reset=true`;
    const response = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Auth-Key': AUTH_KEY
      }
    });

    if (response.status === 200) {
      console.log(`✅ Reset room: ${roomId}`);
      return true;
    } else {
      console.log(`❌ Failed to reset room ${roomId}:`, response.data);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error resetting room ${roomId}:`, error.message);
    return false;
  }
}

// Reset common room types
async function resetAllRooms() {
  console.log('🚀 Starting Durable Object reset...');

  // Common room patterns to reset
  const roomsToReset = [
    'general',           // General chat room
    'emergency', 
    'cardiology',        // Cardiology room
    
    'nursing',          // Nursing station
    'pharmacy',         // Pharmacy
    'lab',              // Laboratory
    'admin',            // Admin room
    'doctors',          // Doctors room
    // Add more room IDs as needed
  ];

  let successCount = 0;
  let failCount = 0;

  for (const roomId of roomsToReset) {
    const success = await resetRoom(roomId);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n🎉 Reset complete!`);
  console.log(`✅ Successfully reset: ${successCount} rooms`);
  console.log(`❌ Failed to reset: ${failCount} rooms`);

  if (failCount === 0) {
    console.log('\n🎯 All Durable Objects have been reset to clean state!');
    console.log('💡 Rooms will recreate fresh on next access.');
  }
}

// Run the reset
resetAllRooms().catch(console.error);