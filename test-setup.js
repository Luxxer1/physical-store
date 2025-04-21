const dotenv = require('dotenv');
const fs = require('fs');

if (fs.existsSync('.env.test')) {
  dotenv.config({ path: '.env.test', override: true });
} else if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env', override: true });
}
