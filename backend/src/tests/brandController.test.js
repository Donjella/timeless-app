const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server'); // Import the Express app correctly
const User = require('../models/userModel');
const Brand = require('../models/brandModel');

// Function to generate unique test users
const generateTestUser = (suffix) => ({
  first_name: 'David',
  last_name: 'Beckham',
  email: `davidbeckham${suffix}@example.com`,
  password: 'CorrectPW',
  phone_number: '1234567890',
  street_address: '123 Main St',
  suburb: 'Springvale',
  state: 'VIC',
  postcode: '3171',
});

// Mock brand data
const testBrand = {
  brand_name: 'BeckhamBrand',
};

// Setup: Database Connection Before Running Tests
beforeAll(async () => {
  const mongoUri = 'mongodb://127.0.0.1:27017/timeless-test';
  await mongoose.connect(mongoUri);
});

// Cleanup: Clear Database After Each Test
afterEach(async () => {
  console.log('Clearing test brands from database...');
  await Brand.deleteMany();
  await User.deleteMany();
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
  let adminToken;

  beforeEach(async () => {
    // Create admin user directly in database
    const adminUser = new User({
      ...generateTestUser('brand-admin'),
      role: 'admin',
    });
    await adminUser.save();
    adminToken = adminUser.generateToken();
  });

  it('Should return validation error for missing required fields', async () => {
    const res = await request(app)
      .post('/api/brands')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ brand_name: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Brand name is required/); // Match actual error message
  });

  it('Should successfully create brand with valid name', async () => {
    const res = await request(app)
      .post('/api/brands')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ brand_name: 'TestBrand' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('brand_name', 'TestBrand');
  });
});

/**
 * Authentication & Authorization Tests
 */
describe('Authentication & Authorization', () => {
  let userToken;

  beforeEach(async () => {
    // Create a regular user
    const user = new User(generateTestUser('brand-auth-user'));
    await user.save();
    userToken = user.generateToken();

    // Create a test brand (no need to reference adminToken or brandId in this section)
    const brand = new Brand(testBrand);
    await brand.save();
  });

  it('Should allow users to view brands', async () => {
    const res = await request(app)
      .get('/api/brands')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Brands endpoint is public, so this test needs to be adjusted
  it('Should allow public access to brands list', async () => {
    const res = await request(app).get('/api/brands');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

/**
 * Database Interaction Tests
 */
describe('Database Interaction', () => {
  let adminToken;

  beforeEach(async () => {
    // Create admin user
    const adminUser = new User({
      ...generateTestUser('brand-db-admin'),
      role: 'admin',
    });
    await adminUser.save();
    adminToken = adminUser.generateToken();
  });

  it('Should create a new brand in the database', async () => {
    const newBrand = {
      brand_name: 'NewTestBrand',
    };

    const res = await request(app)
      .post('/api/brands')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newBrand);

    // Verify the brand was created
    expect(res.statusCode).toBe(201);

    // Check if it exists in the database
    const brand = await Brand.findById(res.body._id);
    expect(brand).toBeTruthy();
    expect(brand.brand_name).toBe(newBrand.brand_name);
  });

  it('Should return 404 for non-existent brand ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/brands/${nonExistentId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Brand not found/);
  });
});

/**
 * Role-Based Access Control Tests
 */
describe('Role-Based Access Control', () => {
  let adminToken;
  let userToken;
  let brandId;

  beforeEach(async () => {
    // Create a regular user
    const user = new User(generateTestUser('brand-rbac-user'));
    await user.save();
    userToken = user.generateToken();

    // Create an admin user
    const adminUser = new User({
      ...generateTestUser('brand-rbac-admin'),
      role: 'admin',
    });
    await adminUser.save();
    adminToken = adminUser.generateToken();

    // Create a test brand
    const brand = new Brand(testBrand);
    await brand.save();
    brandId = brand._id;
  });

  it('Should allow admin to create new brands', async () => {
    const newBrand = {
      brand_name: 'AdminCreatedBrand',
    };

    const res = await request(app)
      .post('/api/brands')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newBrand);

    expect(res.statusCode).toBe(201);
    expect(res.body.brand_name).toBe(newBrand.brand_name);
  });

  it('Should prevent normal users from creating brands', async () => {
    const newBrand = {
      brand_name: 'UserCreatedBrand',
    };

    const res = await request(app)
      .post('/api/brands')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newBrand);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Not authorized as admin/);
  });

  it('Should allow admin to update brands', async () => {
    // Use PUT instead of PATCH since your route is using PUT
    const updatedBrand = {
      brand_name: 'UpdatedBrandName',
    };

    const res = await request(app)
      .put(`/api/brands/${brandId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatedBrand);

    expect(res.statusCode).toBe(200);
    expect(res.body.brand_name).toBe(updatedBrand.brand_name);
  });

  it('Should prevent normal users from updating brands', async () => {
    // Use PUT instead of PATCH since your route is using PUT
    const updatedBrand = {
      brand_name: 'UserUpdatedBrand',
    };

    const res = await request(app)
      .put(`/api/brands/${brandId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updatedBrand);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Not authorized as admin/);
  });

  it('Should allow admin to delete brands', async () => {
    const res = await request(app)
      .delete(`/api/brands/${brandId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Brand removed/); // Match actual message

    // Verify brand was deleted
    const brand = await Brand.findById(brandId);
    expect(brand).toBeNull();
  });

  it('Should prevent normal users from deleting brands', async () => {
    const res = await request(app)
      .delete(`/api/brands/${brandId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Not authorized as admin/);
  });
});
