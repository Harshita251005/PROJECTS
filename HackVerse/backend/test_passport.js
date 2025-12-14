require('dotenv').config();
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
try {
  require('./config/passport');
  console.log('Passport config loaded successfully');
} catch (error) {
  console.error('Error loading passport config:', error);
}
