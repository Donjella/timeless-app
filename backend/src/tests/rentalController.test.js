const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/userModel');
const Watch = require('../models/watchModel');
const Rental = require('../models/rentalModel');
const Brand = require('../models/brandModel');

// Function to generate unique test users
const generateTestUser = (suffix, role = 'user') => ({
  first_name: 'David',
  last_name: 'Beckham',
  email: `davidbeckham${suffix}@example.com`,
  password: 'CorrectPW',
  phone_number: '1234567890',
  role,
});

// Function to create a test watch
const createTestWatch = async (brand) => {
  const watch = new Watch({
    brand: brand._id,
    model: 'Test Watch',
    year: 2023,
    rental_day_price: 50,
    condition: 'Good',
    quantity: 5,
  });
  return watch.save();
};

// Function to create a test rental
const createTestRental = async (user, watch) => {
  const rentalDays = 3;
  const rental = new Rental({
    user: user._id,
    watch: watch._id,
    rental_days: rentalDays,
    total_rental_price: watch.rental_day_price * rentalDays,
    rental_start_date: new Date(),
    rental_end_date: new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000),
    rental_status: 'Pending',
    collection_mode: 'Pickup',
  });
  return rental.save();
};

// Database Connection Before Running Tests
beforeAll(async () => {
  const mongoUri = 'mongodb://127.0.0.1:27017/timeless-test';
  await mongoose.connect(mongoUri);
});

// Cleanup: Clear Database After Each Test
afterEach(async () => {
  await User.deleteMany();
  await Watch.deleteMany();
  await Rental.deleteMany();
  await Brand.deleteMany();
});

// Close Database Connection After All Tests
afterAll(async () => {
  await mongoose.connection.close();
});

/**
 * Input Validation & Error Handling Tests
 */
describe('Input Validation & Error Handling', () => {
  let userToken;
  let watch;
  let brand;

  beforeEach(async () => {
    // Create a brand
    brand = new Brand({ brand_name: 'TestBrand' });
    await brand.save();

    // Create a test watch
    watch = await createTestWatch(brand);

    // Create a regular user
    const user = new User(generateTestUser('rental-validation-user'));
    await user.save();
    userToken = user.generateToken();
  });

  it('Should return validation error for missing watch_id', async () => {
    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rental_days: 3 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields: watch_id/);
  });

  it('Should return validation error for missing rental_days', async () => {
    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ watch_id: watch._id });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing required fields: rental_days/);
  });

  it('Should return error for non-existent watch', async () => {
    const fakeWatchId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        watch_id: fakeWatchId,
        rental_days: 3,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Watch not found/);
  });

  it('Should return error for out-of-stock watch', async () => {
    // Set watch quantity to 0
    watch.quantity = 0;
    await watch.save();

    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        watch_id: watch._id,
        rental_days: 3,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Watch is out of stock/);
  });

  it('Should return error for rental duration of 0 days', async () => {
    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        watch_id: watch._id,
        rental_days: 0,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Rental duration must be at least 1 day/);
  });

  it('Should return error for negative rental duration', async () => {
    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        watch_id: watch._id,
        rental_days: -3,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Rental duration must be at least 1 day/);
  });
});

/**
 * Authentication & Authorization Tests
 */
describe('Authentication & Authorization', () => {
  let userToken;
  let adminToken;
  let watch;
  let brand;
  let user;
  let admin;

  beforeEach(async () => {
    brand = new Brand({ brand_name: 'TestBrand' });
    await brand.save();

    watch = await createTestWatch(brand);

    user = new User(generateTestUser('rental-auth-user'));
    await user.save();
    userToken = user.generateToken();

    admin = new User(generateTestUser('rental-auth-admin', 'admin'));
    await admin.save();
    adminToken = admin.generateToken();
  });

  it('Should allow authenticated users to create a rental', async () => {
    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ watch_id: watch._id.toString(), rental_days: 3 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('watch', watch._id.toString());
  });

  it('Should not allow access without authentication', async () => {
    const res = await request(app)
      .post('/api/rentals')
      .send({ watch_id: watch._id, rental_days: 3 });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Not authorized, no token provided/);
  });

  it('Should allow admins to list all rentals', async () => {
    // Create a rental
    const rental = await createTestRental(user, watch);

    const res = await request(app)
      .get('/api/rentals')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]._id).toBe(rental._id.toString());
  });

  it('Should allow users to retrieve their own rental', async () => {
    // Create a rental for the user
    const rental = await createTestRental(user, watch);

    const res = await request(app)
      .get(`/api/rentals/${rental._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(rental._id.toString());
  });
});

/**
 * Database Interaction Tests
 */
describe('Database Interaction', () => {
  let userToken;
  let watch;
  let brand;
  let user;

  beforeEach(async () => {
    brand = new Brand({ brand_name: 'TestBrand' });
    await brand.save();

    watch = await createTestWatch(brand);

    user = new User(generateTestUser('rental-db-user'));
    await user.save();
    userToken = user.generateToken();
  });

  it('Should create a new rental in the database', async () => {
    const res = await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ watch_id: watch._id.toString(), rental_days: 3 });

    expect(res.statusCode).toBe(201);

    const rental = await Rental.findById(res.body._id);
    expect(rental).toBeTruthy();
    expect(rental.watch.toString()).toBe(watch._id.toString());
  });

  it('Should decrease watch quantity when rented', async () => {
    const initialQuantity = watch.quantity;

    await request(app)
      .post('/api/rentals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ watch_id: watch._id.toString(), rental_days: 3 });

    // Refresh the watch from the database
    const updatedWatch = await Watch.findById(watch._id);
    expect(updatedWatch.quantity).toBe(initialQuantity - 1);
  });
});
