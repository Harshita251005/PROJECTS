try {
  console.log('Requiring messageController...');
  const controller = require('./controllers/messageController');
  console.log('Success!');
} catch (error) {
  console.error('Error requiring messageController:', error);
}
