/**
 * Keep Strapi Instance Alive
 * 
 * This script pings your Strapi instance every 10 minutes to prevent it from spinning down
 * on free hosting services like Render.
 * 
 * Usage:
 *   node scripts/keep-strapi-alive.js
 * 
 * Run this in a separate terminal and leave it running while you work.
 */

import 'dotenv/config';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.VITE_STRAPI_URL || 'https://smarthoster-blogs-1.onrender.com';

// Ping interval: 10 minutes (600000 ms)
// Render free tier spins down after 15 minutes, so 10 minutes keeps it alive
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

async function pingStrapi() {
  try {
    const response = await fetch(`${STRAPI_URL}/api`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`✅ [${timestamp}] Strapi is alive: ${STRAPI_URL}`);
      return true;
    } else {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`⚠️  [${timestamp}] Strapi responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`❌ [${timestamp}] Failed to ping Strapi:`, error.message);
    return false;
  }
}

// Initial ping
console.log(`🚀 Starting Strapi keep-alive service...`);
console.log(`📍 Strapi URL: ${STRAPI_URL}`);
console.log(`⏰ Ping interval: ${PING_INTERVAL / 1000 / 60} minutes`);
console.log(`\nPress Ctrl+C to stop\n`);

pingStrapi();

// Set up interval
const intervalId = setInterval(pingStrapi, PING_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping keep-alive service...');
  clearInterval(intervalId);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Stopping keep-alive service...');
  clearInterval(intervalId);
  process.exit(0);
});

