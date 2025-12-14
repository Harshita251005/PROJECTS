const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const verifyAdminFeatures = async () => {
  try {
    // 1. Login to get token
    const loginRes = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@hackverse.com',
      password: 'admin123'
    });

    if (!loginRes.data.success) {
      console.error('Login failed:', loginRes.data);
      return;
    }

    const token = loginRes.data.token;
    console.log('Login successful.');

    // 2. Check System Health
    try {
      const sysRes = await axios.get('http://localhost:4000/api/admin/system', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('System Health:', sysRes.data.success ? 'OK' : 'FAILED');
      if (sysRes.data.success) console.log(sysRes.data.data);
    } catch (err) {
      console.error('System Health API Failed:', err.response ? err.response.data : err.message);
    }

    // 3. Create Announcement
    try {
      const annRes = await axios.post('http://localhost:4000/api/admin/announcements', {
        title: 'Test Announcement',
        content: 'This is a test.',
        type: 'broadcast',
        priority: 'normal'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Create Announcement:', annRes.data.success ? 'OK' : 'FAILED');
    } catch (err) {
      console.error('Create Announcement API Failed:', err.response ? err.response.data : err.message);
    }

    // 4. Get Announcements
    try {
      const getAnnRes = await axios.get('http://localhost:4000/api/admin/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Get Announcements:', getAnnRes.data.success ? 'OK' : 'FAILED');
      console.log('Count:', getAnnRes.data.data.length);
    } catch (err) {
      console.error('Get Announcements API Failed:', err.response ? err.response.data : err.message);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
};

verifyAdminFeatures();
