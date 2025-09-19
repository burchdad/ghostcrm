// Run with: node scripts/nightly-cleanup.js
require('dotenv').config();
const { cleanupExpiredPasswordResets } = require('../src/lib/cleanupPasswordResets');

(async () => {
  const result = await cleanupExpiredPasswordResets();
  if (result.success) {
    console.log(`Deleted ${result.deleted} expired password reset rows.`);
    process.exit(0);
  } else {
    console.error('Cleanup failed:', result.error);
    process.exit(1);
  }
})();
