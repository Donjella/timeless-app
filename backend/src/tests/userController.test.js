const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server'); // Import the Express app
const User = require('../models/userModel'); // Import the User model

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

// Setup: Database Connection Before Running Tests
beforeAll(async () => {
  const mongoUri = 'mongodb://127.0.0.1:27017/timeless-test';
  await mongoose.connect(mongoUri);
});

// Cleanup: Clear Database After Each Test
afterEach(async () => {
  console.log('Clearing test users from database...');
  await User.deleteMany(); // Ensures each test starts fresh
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
  it('Should return validation error for missing required fields on registration', async () => {
    const res = await request(app).post('/api/users/register').send({ email: 'test@example.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields/);
  });

  it('Should not log in with incorrect password', async () => {
    // Register a user first
    await request(app).post('/api/users/register').send(testUser);

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: testUser.email, password: 'oopsWrongPassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Invalid email or password/);
  });
});

/**
 * Authentication & Authorization Tests
 */
describe('Authentication & Authorization', () => {
  let userToken;

  beforeEach(async () => {
    // Register a regular user
    const userRes = await request(app).post('/api/users/register').send(testUser);
    userToken = userRes.body.token;
  });

  it('Should register a new user and return a token', async () => {
    const newUser = { ...testUser, email: 'newuser@example.com' };
    const res = await request(app).post('/api/users/register').send(newUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe(newUser.email);
  });

  it('Should log in an existing user and return a token', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('Should return user profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  it('Should not allow access to profile without a token', async () => {
    const res = await request(app).get('/api/users/profile');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Not authorized/);
  });
});

/**
 * Database Interaction (Service Layer Logic) Tests
 */
describe('Database Interaction', () => {
  it('Should not register a user with an existing email', async () => {
    await request(app).post('/api/users/register').send(testUser); // Register first user

    const res = await request(app).post('/api/users/register').send(testUser); // Try again

    expect(res.statusCode).toBe(409); // Conflict error
    expect(res.body.message).toMatch(/User with this email already exists/);
  });

  it('Should not log in a non-existing user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'nobody@example.com', password: 'CorrectPW' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Invalid email or password/);
  });
});

/**
 * Role-Based Access Control Tests
 */
describe('Role-Based Access Control', () => {
  let adminToken;
  let userToken;
  let userId;

  beforeEach(async () => {
    // Register a normal user through API
    const userRes = await request(app).post('/api/users/register').send(testUser);
    userToken = userRes.body.token;
    userId = userRes.body._id;

    // Create admin user directly in database
    const adminUser = new User({
      ...testUser,
      email: 'admin@example.com',
      role: 'admin',
      password: 'CorrectPW', // Need to set password directly since we're bypassing registration
    });
    await adminUser.save();

    // Get admin token by generating it directly
    adminToken = adminUser.generateToken();
  });

  it('Should allow admin to list all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Should not allow normal users to list all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Not authorized as admin/);
  });

  it('Should allow admin to update user role', async () => {
    const res = await request(app)
      .patch(`/api/users/role/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/User role updated/);
  });

  it('Should prevent non-admins from updating roles', async () => {
    const res = await request(app)
      .patch(`/api/users/role/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ role: 'admin' });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Not authorized as admin/);
  });

  // New tests for Get User by ID and User Deletion
  describe('Get User by ID (Admin Only)', () => {
    it('Should allow admin to get user by ID', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(userId);
      expect(res.body).toHaveProperty('email');
    });

    it('Should prevent non-admin from getting user by ID', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Not authorized as admin/);
    });

    it('Should return 404 for non-existent user ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/User not found/);
    });
  });

  describe('Delete User (Admin Only)', () => {
    it('Should allow admin to delete a user', async () => {
      // Create a user to be deleted
      const userToDeleteRes = await request(app)
        .post('/api/users/register')
        .send({
          ...testUser,
          email: 'delete@example.com',
        });
      const userToDeleteId = userToDeleteRes.body._id;

      const res = await request(app)
        .delete(`/api/users/${userToDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/User successfully deleted/);
      expect(res.body.deletedUserId).toBe(userToDeleteId);

      // Verify user is actually deleted from database
      const deletedUser = await User.findById(userToDeleteId);
      expect(deletedUser).toBeNull();
    });

    it('Should prevent non-admin from deleting a user', async () => {
      const res = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Not authorized as admin/);

      // Verify user still exists in database
      const user = await User.findById(userId);
      expect(user).not.toBeNull();
    });

    it('Should return 404 when trying to delete a non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/User not found/);
    });
  });
});

module.exports = testUser;
// Used for DRY principles, export testUser to be reused in different tests
