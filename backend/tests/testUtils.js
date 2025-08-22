const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

// Utility to create a test user and get JWT token
async function getTestUserToken() {
  const email = `testuser${Date.now()}@example.com`;
  const password = 'Test1234!';
  await request(app).post('/api/users/register').send({ name: 'Test User', email, password });
  // Make the user an admin for testing
  const User = require('../models/User');
  await User.updateOne({ email }, { isAdmin: true });
  // Log in again to get a token with admin status
  const res = await request(app).post('/api/users/login').send({ email, password });
  return res.body.token;
}

module.exports = { getTestUserToken };
