const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server'); // Import the Express app
const User = require('../models/userModel');
const Address = require('../models/addressModel');

// Mock user data
const testUser = {
  first_name: 'David',
  last_name: 'Beckham',
  email: 'davidbeckham@example.com',
  password: 'CorrectPW',
  phone_number: '1234567890',
  street_address: '123 Main St',
  suburb: 'Springvale',
  state: 'VIC',
  postcode: '3171',
};

// Mock address data
const testAddress = {
  street_address: '456 Park Avenue',
  suburb: 'Richmond',
  state: 'VIC',
  postcode: '3121',
};

// Setup: Database Connection Before Running Tests
beforeAll(async () => {
  const mongoUri = 'mongodb://127.0.0.1:27017/timeless-test';
  await mongoose.connect(mongoUri);
});

// Cleanup: Clear Database After Each Test
afterEach(async () => {
  console.log('Clearing test users and addresses from database...');
  await User.deleteMany();
  await Address.deleteMany();
});

// Close Database Connection After All Tests
afterAll(async () => {
  await mongoose.connection.close();
  console.log('Disconnected from test database');
});

/**
 * Input Validation & Error Handling Tests
 */
describe('Input Validation & Error Handling', () => {
  let userToken;

  beforeEach(async () => {
    // Register a user to get token for authenticated requests
    const userRes = await request(app).post('/api/users/register').send(testUser);
    userToken = userRes.body.token;
  });

  it('Should return validation error for missing required fields', async () => {
    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ street_address: '123 Main St' }); // Missing suburb, state, postcode

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields/);
  });

  it('Should return validation error for invalid state', async () => {
    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        street_address: '123 Main St',
        suburb: 'Springvale',
        state: 'INVALID', // Invalid state
        postcode: '3171',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/state/);
  });

  it('Should return validation error for invalid postcode', async () => {
    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        street_address: '123 Main St',
        suburb: 'Springvale',
        state: 'VIC',
        postcode: '12345', // Invalid 5-digit postcode
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/postcode/);
  });
});

/**
 * Authentication & Authorization Tests
 */
describe('Authentication & Authorization', () => {
  let userToken;
  let addressId;

  beforeEach(async () => {
    // Register a user
    const userRes = await request(app).post('/api/users/register').send(testUser);
    userToken = userRes.body.token;
    // Create an address for testing
    const addressRes = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${userToken}`)
      .send(testAddress);
    addressId = addressRes.body._id;
  });

  it('Should allow authenticated users to create an address', async () => {
    const newAddress = {
      street_address: '789 New Street',
      suburb: 'Carlton',
      state: 'VIC',
      postcode: '3053',
    };

    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newAddress);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.street_address).toBe(newAddress.street_address);
  });

  it('Should allow users to retrieve an address by ID', async () => {
    const res = await request(app)
      .get(`/api/addresses/${addressId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.street_address).toBe(testAddress.street_address);
  });

  it('Should not allow access without authentication', async () => {
    const res = await request(app).get(`/api/addresses/${addressId}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Not authorized/);
  });
});

/**
 * Database Interaction Tests
 */
describe('Database Interaction', () => {
  let userToken;

  beforeEach(async () => {
    // Register a user
    const userRes = await request(app).post('/api/users/register').send(testUser);
    userToken = userRes.body.token;

    // Create an address (not saving the ID since we don't use it)
    await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${userToken}`)
      .send(testAddress);
  });

  it('Should create a new address in the database', async () => {
    const newAddress = {
      street_address: '987 Test Street',
      suburb: 'Brunswick',
      state: 'VIC',
      postcode: '3056',
    };

    const res = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newAddress);

    // Verify the address was created
    const address = await Address.findById(res.body._id);
    expect(address).toBeTruthy();
    expect(address.street_address).toBe(newAddress.street_address);
  });

  it('Should return 404 for non-existent address ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/addresses/${nonExistentId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Address not found/);
  });
});

/**
 * Role-Based Access Control Tests
 */
describe('Role-Based Access Control', () => {
  let adminToken;
  let userToken;
  let addressId;

  beforeEach(async () => {
    // Register a normal user
    const userRes = await request(app).post('/api/users/register').send(testUser);
    userToken = userRes.body.token;

    // Create an address for testing
    const addressRes = await request(app)
      .post('/api/addresses')
      .set('Authorization', `Bearer ${userToken}`)
      .send(testAddress);
    addressId = addressRes.body._id;

    // Create admin user directly in database
    const adminUser = new User({
      ...testUser,
      email: 'admin@example.com',
      role: 'admin',
      password: 'CorrectPW',
    });
    await adminUser.save();

    // Get admin token
    adminToken = adminUser.generateToken();
  });

  it('Should allow admin to list all addresses', async () => {
    const res = await request(app)
      .get('/api/addresses')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Should prevent normal users from listing all addresses', async () => {
    const res = await request(app)
      .get('/api/addresses')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Not authorized as admin/);
  });

  it('Should allow admin to update an address', async () => {
    const updatedAddress = {
      street_address: '555 Admin St',
      suburb: 'Southbank',
      state: 'VIC',
      postcode: '3006',
    };

    const res = await request(app)
      .patch(`/api/addresses/${addressId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatedAddress);

    expect(res.statusCode).toBe(200);
    expect(res.body.street_address).toBe(updatedAddress.street_address);
  });

  it('Should prevent normal users from updating addresses', async () => {
    const updatedAddress = {
      street_address: '555 User St',
      suburb: 'Southbank',
      state: 'VIC',
      postcode: '3006',
    };

    const res = await request(app)
      .patch(`/api/addresses/${addressId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedAddress);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Access denied. Admin only./);
  });

  it('Should allow admin to delete an address', async () => {
    const res = await request(app)
      .delete(`/api/addresses/${addressId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Address deleted successfully/);

    // Verify address was deleted
    const address = await Address.findById(addressId);
    expect(address).toBeNull();
  });

  it('Should prevent normal users from deleting addresses', async () => {
    const res = await request(app)
      .delete(`/api/addresses/${addressId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Access denied. Admin only./);
  });
});
