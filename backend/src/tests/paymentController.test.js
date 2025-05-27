const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/userModel');
const Payment = require('../models/paymentModel');
const Rental = require('../models/rentalModel');
const Watch = require('../models/watchModel');
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

// Function to create a test rental
const createTestRental = async (user, watch) => {
  const rental = new Rental({
    user: user._id,
    watch: watch._id,
    rental_start_date: new Date(),
    rental_end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    rental_status: 'Pending',
    total_rental_price: 150,
    collection_mode: 'Pickup',
  });
  return rental.save();
};

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

// Function to create a test payment
const createTestPayment = async (userToken, rental) => {
  const res = await request(app)
    .post('/api/payments')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      rental_id: rental._id,
      amount: 150,
      payment_method: 'Credit Card',
      transaction_id: 'test-transaction-123',
    });

  return res.body;
};

describe('Payment Controller Tests', () => {
  let userToken;
  let adminToken;
  let user;
  let admin;
  let brand;
  let watch;
  let rental;

  // Setup before all tests
  beforeAll(async () => {
    const mongoUri = 'mongodb://127.0.0.1:27017/timeless-test';
    await mongoose.connect(mongoUri);
  });

  // Cleanup after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Setup before each test
  beforeEach(async () => {
    // Clear databases
    await User.deleteMany();
    await Payment.deleteMany();
    await Rental.deleteMany();
    await Watch.deleteMany();
    await Brand.deleteMany();

    // Create a brand
    brand = new Brand({ brand_name: 'TestBrand' });
    await brand.save();

    // Create a watch
    watch = await createTestWatch(brand);

    // Create a regular user
    user = new User(generateTestUser('payment-user'));
    await user.save();
    userToken = user.generateToken();

    // Create an admin user
    admin = new User(generateTestUser('payment-admin', 'admin'));
    await admin.save();
    adminToken = admin.generateToken();

    // Create a rental
    rental = await createTestRental(user, watch);
  });

  describe('Input Validation & Error Handling', () => {
    it('Should return validation error for missing required fields', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Missing required fields/);
    });

    it('Should return error for non-existent rental', async () => {
      const fakeRentalId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rental_id: fakeRentalId,
          amount: 150,
          payment_method: 'Credit Card',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/Rental not found/);
    });

    it('Should return error for invalid payment method', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rental_id: rental._id,
          amount: 150,
          payment_method: 'InvalidMethod',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Invalid payment method/);
    });
  });

  describe('Authentication & Authorization', () => {
    it('Should allow authenticated users to create a payment for their own rental', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rental_id: rental._id,
          amount: 150,
          payment_method: 'Credit Card',
          transaction_id: 'test-transaction-123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('rental');

      // Verify payment was created in the database
      const payment = await Payment.findById(res.body._id);
      expect(payment).toBeTruthy();
      expect(payment.rental.toString()).toBe(rental._id.toString());
    });

    it('Should not allow access without authentication', async () => {
      const res = await request(app)
        .post('/api/payments')
        .send({
          rental_id: rental._id,
          amount: 150,
          payment_method: 'Credit Card',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Not authorized/);
    });

    it('Should allow users to view their own payments', async () => {
      // Create a payment
      const payment = await createTestPayment(userToken, rental);

      // Get the payment by ID as the user who created it
      const res = await request(app)
        .get(`/api/payments/${payment._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(payment._id);
    });
  });

  describe('Database Interaction', () => {
    it('Should create a new payment in the database', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rental_id: rental._id,
          amount: 150,
          payment_method: 'Credit Card',
          transaction_id: 'test-transaction-123',
        });

      expect(res.statusCode).toBe(201);

      const payment = await Payment.findById(res.body._id);
      expect(payment).toBeTruthy();
      expect(payment.rental.toString()).toBe(rental._id.toString());
    });

    it('Should return 404 for non-existent payment ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/payments/${nonExistentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/Payment not found/);
    });
  });

  describe('Role-Based Access Control', () => {
    describe('Admin Payment Operations', () => {
      it('Should allow admin to list all payments', async () => {
        // Create a payment first
        await createTestPayment(userToken, rental);

        const res = await request(app)
          .get('/api/payments')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      });

      it('Should allow admin to view any payment', async () => {
        // Create a payment first
        const payment = await createTestPayment(userToken, rental);

        // View as admin
        const res = await request(app)
          .get(`/api/payments/${payment._id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(payment._id);
      });

      it('Should allow admin to update payment status', async () => {
        // Create a payment first
        const payment = await createTestPayment(userToken, rental);

        // Update as admin
        const res = await request(app)
          .patch(`/api/payments/${payment._id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            payment_status: 'Refunded',
            transaction_id: 'refund-123',
          });

        expect(res.statusCode).toBe(200);
        expect(res.body.payment_status).toBe('Refunded');
      });

      it('Should allow admin to delete a payment', async () => {
        // Create a payment first
        const payment = await createTestPayment(userToken, rental);

        // Delete as admin
        const res = await request(app)
          .delete(`/api/payments/${payment._id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/Payment removed/);

        // Verify it was deleted
        const deletedPayment = await Payment.findById(payment._id);
        expect(deletedPayment).toBeNull();
      });
    });

    describe('User Permission Restrictions', () => {
      it('Should prevent non-admin users from accessing all payments', async () => {
        // Create a payment first
        await createTestPayment(userToken, rental);

        // Try to access all payments as regular user
        const res = await request(app)
          .get('/api/payments')
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/Not authorized as admin/);
      });

      it('Should prevent users from accessing other users\' payments', async () => {
        // Create a payment
        const payment = await createTestPayment(userToken, rental);

        // Create a different user
        const otherUser = new User(generateTestUser('other-user'));
        await otherUser.save();
        const otherUserToken = otherUser.generateToken();

        // Try to access the payment as different user
        const res = await request(app)
          .get(`/api/payments/${payment._id}`)
          .set('Authorization', `Bearer ${otherUserToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/Not authorized/);
      });

      it('Should prevent non-admin users from updating payment status', async () => {
        // Create a payment first
        const payment = await createTestPayment(userToken, rental);

        // Try to update as regular user
        const res = await request(app)
          .patch(`/api/payments/${payment._id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            payment_status: 'Refunded',
          });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/Not authorized as admin/);

        // Verify payment wasn't changed
        const updatedPayment = await Payment.findById(payment._id);
        expect(updatedPayment.payment_status).toBe('Completed');
      });

      it('Should prevent non-admin users from deleting payments', async () => {
        // Create a payment first
        const payment = await createTestPayment(userToken, rental);

        // Try to delete as regular user
        const res = await request(app)
          .delete(`/api/payments/${payment._id}`)
          .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/Not authorized as admin/);

        // Verify payment wasn't deleted
        const existingPayment = await Payment.findById(payment._id);
        expect(existingPayment).toBeTruthy();
      });
    });
  });

  describe('User Payment History', () => {
    it('Should allow users to view all their own payments', async () => {
      // Create multiple payments for the user
      await createTestPayment(userToken, rental);
      await createTestPayment(userToken, rental);

      // Get all user payments
      const res = await request(app)
        .get('/api/payments/user/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });
});
