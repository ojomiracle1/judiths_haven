const fs = require('fs');
const path = require('path');

// Update frontend environment file
const frontendEnvPath = path.join(__dirname, 'frontend', '.env.production');
const frontendEnvContent = 'REACT_APP_API_URL=https://judiths-haven-backend.onrender.com/api\n';

fs.writeFileSync(frontendEnvPath, frontendEnvContent);
console.log('✅ Updated frontend/.env.production with correct backend URL');

console.log('\n📋 Next Steps:');
console.log('1. Set FRONTEND_URL=https://judiths-haven-frontend.onrender.com in your Render backend environment variables');
console.log('2. Set NODE_ENV=production in your Render backend environment variables');
console.log('3. Commit and push these changes');
console.log('4. Your app should now work with the production URLs!');
