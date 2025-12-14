const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const verifyAdminApi = async () => {
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
    console.log('Login successful. Token obtained.');

    // 2. Call Admin Stats API
    try {
      const statsRes = await axios.get('http://localhost:4000/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Admin Stats Response:', JSON.stringify(statsRes.data, null, 2));
    } catch (err) {
      console.error('Admin Stats API Failed:', err.response ? err.response.data : err.message);
    }

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

verifyAdminApi();
