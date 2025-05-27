## Table of Contents

- [Important Links](#important-links)
- [Overview](#overview)
- [Industry-Relevant Technologies and Their Alternatives](#industry-relevant-technologies-and-their-alternatives)
  - [Backend Framework: Node.js & Express.js](#backend-framework-nodejs--expressjs)
  - [Database: MongoDB & Mongoose](#database-mongodb--mongoose)
  - [Cloud Database: MongoDB Atlas](#cloud-database-mongodb-atlas)
  - [Authentication & Security: JWT & Bcrypt.js](#authentication--security-jwt--bcryptjs)
  - [Middleware & Error Handling](#middleware--error-handling)
- [Hardware Requirements](#hardware-requirements)
  - [Development Environment (Local Machine)](#1-development-environment-local-machine)
  - [Production Environment (Cloud Hosting)](#2-production-environment-cloud-hosting)
- [Coding Style Guide and Conventions](#coding-style-guide-and-conventions)
  - [Airbnb JavaScript Style Guide](#airbnb-javascript-style-guide)
  - [ESLint Implementation](#eslint-implementation)
  - [Naming Conventions](#naming-conventions)
  - [Key Style Principles](#key-style-principles)
  - [Practical Implementation](#practical-implementation)
- [Project Dependencies](#project-dependencies)
  - [Core Dependencies](#core-dependencies)
  - [Development Dependencies](#development-dependencies)
  - [Dependency Management](#dependency-management)
- [Application Setup](#application-setup)
  - [Clone the Repository](#1-clone-the-repository)
  - [Install Dependencies](#2-install-dependencies)
  - [Set Up Environment Variables](#3-set-up-environment-variables)
  - [Start the Development Server](#4-start-the-development-server)
  - [Running Tests](#5-running-tests)
  - [Production Deployment](#6-production-deployment)
- [API Endpoints](#api-endpoints)
  - [Base URLs](#base-urls)
  - [Authentication](#authentication)
  - [User Routes](#user-routes)
  - [Watch Routes](#watch-routes)
  - [Brand Routes](#brand-routes)
  - [Rental Routes](#rental-routes)
  - [Payment Routes](#payment-routes)
  - [Address Routes](#address-routes)
  - [Access Levels](#access-levels)

## Important Links

❗️Deployment URL - [https://timeless-back-end.onrender.com](https://brendon-event-api.onrender.com/) 

❗️Production endpoint - [http://localhost:5000]()

For specific API endpoints, please [click here](#api-endpoints) to see API endpoints.  

## Overview
The **Luxury Watch Backend** is a high-performance, scalable **Node.js & Express API** designed to handle watch rentals, user authentication, payment processing, and brand management. Built with **MongoDB**, it ensures flexibility in handling structured and unstructured data efficiently. This backend follows industry best practices in security, maintainability, and performance.

## Industry-Relevant Technologies and Their Alternatives
To ensure this project meets industry standards, we have carefully selected technologies that enhance **performance, security, scalability, and ease of maintenance**. Each technology choice is explained below with its industry relevance, purpose, alternatives, and licensing details.

### Backend Framework: Node.js & Express.js
The backend is built using **Node.js**, a **non-blocking, event-driven runtime**, and **Express.js**, a lightweight web framework that simplifies API development.

- **Industry Relevance**: 
  - Used by major companies like Netflix, LinkedIn, and PayPal.
  - Widely adopted for building scalable web services
  - Strong community support with regular updates and security patches

- **Purpose in Our Project**:
  - Provides the foundation for our REST API architecture
  - Handles HTTP requests for user authentication, watch management, and rental operations
  - Enables efficient database operations through asynchronous processing

- **Alternatives Comparison**:
  - **Django (Python):** Great for rapid development with built-in admin panel, but its synchronous nature makes it less efficient for high-concurrency applications
  - **Spring Boot (Java):** Excellent for large-scale enterprise applications but has a steeper learning curve and requires more configuration
  - **ASP.NET (C#):** Highly scalable and secure, but tightly integrated with the Microsoft ecosystem, making it less flexible for open-source projects

- **Licensing**:
  - **Node.js**: MIT License - Permits commercial and private use, modification, and distribution with minimal restrictions
  - **Express.js**: MIT License - Same permissions and conditions as Node.js, fully compatible with commercial projects

### Database: MongoDB & Mongoose
**MongoDB**, a NoSQL database, is used to store data in collections such as users, rentals, payments, brands, addresses, and watches. 

**Mongoose** provides an Object Data Modeling (ODM) layer for structured interaction with MongoDB.

- **Industry Relevance**:
  - Used by companies like Uber, eBay, and Electronic Arts
  - Ideal for applications requiring rapid development and flexible data models
  - Excellent for handling JSON-like data structures

- **Purpose in Our Project**:
  - Stores all application data including user profiles, watch inventory, rental records, and payment information
  - Provides flexible schema that adapts to evolving business requirements
  - Enables efficient querying for watch filtering and rental management

- **Alternatives Comparison**:
  - **PostgreSQL:** Highly structured and ensures data integrity, but schema modifications can be complex for rapidly evolving applications
  - **MySQL:** Great for structured data but lacks MongoDB's flexibility in handling JSON-like documents
  - **Firebase:** Easy to use but provides less control over querying and indexing compared to MongoDB

- **Licensing**:
  - **MongoDB**: Server Side Public License (SSPL) - Free for most use cases including local development and standard production deployment; requires source code disclosure if offering MongoDB as a service
  - **Mongoose**: MIT License - Permits commercial and private use without restrictions

### Cloud Database: MongoDB Atlas
For production, we leverage **MongoDB Atlas**, a fully managed cloud database service.

- **Industry Relevance**:
  - Used by thousands of companies for production MongoDB deployments
  - Considered the industry standard for managed MongoDB hosting
  - Supported directly by MongoDB, Inc., ensuring latest features and security updates

- **Purpose in Our Project**:
  - Provides production-ready database environment with minimal setup
  - Ensures data persistence, backup, and security for our application
  - Simplifies database management with automated monitoring and scaling

- **Key Features**:
  - **Automatic scaling** based on demand
  - **Built-in security** with encryption and access control
  - **Automated backups** to ensure data safety
  - **Global distribution** for low-latency access worldwide

- **Alternatives Comparison**:
  - **Self-hosted MongoDB:** Lower monthly costs but requires significant DevOps expertise
  - **Amazon DocumentDB:** Compatible with MongoDB but lacks some advanced features
  - **Google Cloud Firestore:** Easier to set up but offers less control and configuration options

- **Licensing**:
  - **MongoDB Atlas**: Service-based subscription - Free tier available for development and small production workloads; paid tiers based on storage, memory, and CPU requirements

### Authentication & Security: JWT & Bcrypt.js
For authentication, **JSON Web Tokens (JWT)** are used to handle user logins securely. **Bcrypt.js** ensures passwords are **hashed** and protected from brute-force attacks.

- **Industry Relevance**:
  - JWT is used by **Google, Facebook, and GitHub** for authentication
  - Bcrypt is an industry-standard for password hashing in **banking, healthcare, and enterprise applications**
  - Both technologies are considered security best practices in web development

- **Purpose in Our Project**:
  - Implements secure user authentication and authorization
  - Protects user credentials through industry-standard password hashing
  - Enables role-based access control for admin versus regular user functionality

- **Alternatives Comparison**:
  - **OAuth2:** More secure for third-party authentication but **complex to implement** for simple applications
  - **Firebase Authentication:** Easy to set up but **less customizable** compared to JWT
  - **Passport.js:** More feature-rich but adds complexity for our straightforward authentication needs

- **Licensing**:
  - **JWT (jsonwebtoken package)**: MIT License - Free for commercial use with no restrictions
  - **Bcrypt.js**: MIT License - No restrictions on usage in our application

### Middleware & Error Handling
To ensure **smooth API responses and error consistency**, the project implements various middleware components.

- **Industry Relevance**:
  - Standard approach in modern API development
  - Used by enterprise-grade applications for error handling and request processing
  - Considered best practice for maintainable API design

- **Purpose in Our Project**:
  - Ensures standardized API responses across all endpoints
  - Centralizes error handling to improve debugging and user experience
  - Enables cross-origin requests for frontend integration
  - Protects routes from unauthorized access
  - Implements role-based access control

- **Custom Middleware Implementation**:

  **1. Authentication Middleware (`authMiddleware.js`)**
  ```javascript
  const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        [, token] = req.headers.authorization.split(' ');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        
        next();
      } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    } else {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
  });

  const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
  };
  ```

  **2. Error Handler (`errorHandler.js`)**
  ```javascript
  const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Internal Server Error';

    if (err instanceof AppError) {
      statusCode = err.statusCode || 500;
      message = err.message;
    }

    switch (err.name) {
      case 'ValidationError':
        statusCode = 400;
        message = err.message || 'Validation Error';
        break;
      case 'CastError':
        statusCode = 400;
        message = `Invalid ${err.path}`;
        break;
      case 'JsonWebTokenError':
      case 'TokenExpiredError':
        statusCode = 401;
        message = 'Invalid or expired token, please log in again';
        break;
      default:
        break;
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
  };
  ```

  **3. Payment Middleware (`paymentMiddleware.js`)**
  ```javascript
  const setPaymentDateOnComplete = function updatePaymentDate(next) {
    if (this.isModified('payment_status') && this.payment_status === 'Completed') {
      this.payment_date = new Date();
    }
    next();
  };
  ```

- **Key Middleware Components**:
  - **Authentication Middleware** (`authMiddleware.js`): Protects routes and verifies admin roles
  - **Error Handler** (`errorHandler.js`): Provides consistent error responses across the API
  - **Payment Middleware** (`paymentMiddleware.js`): Handles payment-specific logic like setting payment dates
  - **Express-Async-Handler**: Simplifies async error handling in route controllers
  - **CORS Middleware**: Allows **cross-origin resource sharing**, enabling frontend communication

- **Alternatives Comparison**:
  - **Try-Catch Blocks:** More verbose and prone to inconsistent error handling
  - **Custom Middleware:** Requires more development time but can be tailored to specific needs
  - **Third-party API Gateways:** Offer more features but add complexity and cost

- **Licensing**:
  - **express-async-handler**: MIT License - Free for commercial use with no restrictions
  - **cors**: MIT License - Permits unrestricted use in both commercial and non-commercial applications

## Hardware Requirements

The backend must run efficiently in both development and production environments. Below are the system requirements for our project, their specific purposes, industry relevance, comparisons with alternatives, and licensing considerations.

### 1. Development Environment (Local Machine)

For local development, you need a machine capable of running **Node.js, MongoDB, and a testing environment**.

- **Operating System:**
  - **Chosen Technology**: Windows, macOS, or Linux
  - **Purpose**: Provides the foundation for running development tools, code editors, and local services
  - **Industry Relevance**: All three are widely used in professional development environments
  - **Alternatives Comparison**:
    * **Windows**: Greatest compatibility with development tools but sometimes requires workarounds for Node.js path issues
    * **macOS**: Excellent developer experience but higher hardware cost
    * **Linux**: Most efficient resource usage and closest to production environments but steeper learning curve

- **Processor:** 
  - **Chosen Technology**: Intel Core i5 / AMD Ryzen 5 (or higher)
  - **Purpose**: Ensures efficient compilation, testing, and concurrent development tasks
  - **Industry Relevance**: Standard specification for modern development workstations
  - **Alternatives Comparison**:
    * **Intel Core i3**: Sufficient for basic development but slower test execution
    * **ARM-based processors**: Lower power consumption but potential compatibility issues with some Node.js native extensions

- **Memory (RAM):** 
  - **Chosen Technology**: **8GB minimum, 16GB recommended**
  - **Purpose**: Allows running multiple services simultaneously (Node.js server, MongoDB, code editor, browser testing)
  - **Industry Relevance**: Standard memory configuration for web development workstations
  - **Alternatives Comparison**:
    * **4GB**: Workable for minimal setups but significant performance degradation with multiple services
    * **32GB**: Future-proof but unnecessary cost for most development needs

- **Storage:** 
  - **Chosen Technology**: At least **10GB free SSD space**
  - **Purpose**: Provides fast read/write access for code, dependencies, and local database
  - **Industry Relevance**: SSD is now standard for development environments due to significant performance benefits
  - **Alternatives Comparison**:
    * **HDD storage**: Significantly slower database operations and longer build times
    * **NVMe SSD**: Faster but more expensive with minimal practical benefit for this application

- **Local Database Options**:
  - **Chosen Technology**: MongoDB Community Edition (local) or MongoDB Atlas (Cloud)
  - **Purpose**: Stores application data during development and testing phases
  - **Industry Relevance**: MongoDB is widely used in modern web application stacks
  - **Alternatives Comparison**:
    * **Docker containerized MongoDB**: Better isolation but additional resource overhead
    * **MongoDB Atlas (free tier)**: No local installation needed but requires internet connection
    * **MongoDB in WSL (Windows)**: Better Linux compatibility but additional configuration complexity
  - **Licensing**: MongoDB Community Edition is licensed under SSPL (Server Side Public License)

### 2. Production Environment (Cloud Hosting)

For this project, we deploy the backend using **Render** (Singapore region, free tier) for application hosting and **MongoDB Atlas** (Singapore region, free tier) for database services.

- **Cloud Service Provider**:
  - **Chosen Technology**: Render Web Services (Singapore region, free tier)
  - **Purpose**: Hosts our Node.js application, handles HTTP traffic, and manages deployment
  - **Industry Relevance**: Gaining popularity as a developer-friendly alternative to Heroku and AWS for startups and SMEs
  - **Alternatives Comparison**:
    * **AWS (Amazon EC2/ECS)**: More feature-rich but complex pricing and steeper learning curve
    * **DigitalOcean**: Simpler pricing structure but requires more configuration
    * **Google Cloud Platform**: Better integration with other Google services but potentially higher costs
    * **Heroku**: Similar ease of use but significantly higher cost at scale
  - **Reasons for Choosing Render**:
    * Simplified deployment with Git integration
    * Developer-friendly dashboard and monitoring
    * Free tier sufficient for our development and demonstration needs
    * Singapore region provides lower latency for our target users
  - **Licensing**: Render uses a pay-as-you-go service model with a free tier that includes limited resources

- **Compute Resources**:
  - **Chosen Technology**: Render Web Service (Free plan)
  - **Purpose**: Provides the computing power to run our Node.js application
  - **Industry Relevance**: Virtual/containerized environments are the standard for modern web applications
  - **Alternatives Comparison**:
    * **Paid tier (Standard)**: Provides more resources and uptime but unnecessary for our current needs
    * **On-demand scaling**: Available in paid tiers for handling traffic spikes but not needed for this project

- **Memory (RAM)**: 
  - **Chosen Technology**: 512MB (free tier)
  - **Purpose**: Ensures sufficient memory for Node.js runtime and concurrent request handling
  - **Industry Relevance**: Standard entry-level memory allocation for web service containers
  - **Alternatives Comparison**:
    * **1GB+ RAM**: Available in paid tiers, would provide better performance under load but unnecessary for demonstration purposes

- **Database Hosting**:
  - **Chosen Technology**: **MongoDB Atlas** (Singapore region, free tier)
  - **Purpose**: Provides reliable database storage for application data
  - **Industry Relevance**: Leading cloud database service for MongoDB with strong industry adoption
  - **Alternatives Comparison**:
    * **Self-hosted MongoDB**: More control but requires significant DevOps expertise
    * **Amazon DocumentDB**: AWS-compatible alternative but more expensive and missing some MongoDB features
    * **CosmosDB (Azure)**: Good scaling but higher cost and vendor lock-in
  - **Reasons for Choosing MongoDB Atlas**:
    * Free tier sufficient for our project requirements
    * Zero-configuration setup with our application
    * Singapore region provides lower latency for our target users
    * Includes basic monitoring and backup features even in free tier
  - **Licensing**: MongoDB Atlas free tier includes 512MB storage with shared RAM

- **Network Configuration**:
  - **Chosen Technology**: Singapore region for both Render and MongoDB Atlas
  - **Purpose**: Optimizes network latency for our target user base as they are deployed within the same region which reduces latency.
  - **Industry Relevance**: Regional deployment is standard practice for optimizing application performance
  - **Alternatives Comparison**:
    * **US-based regions**: Higher latency for Asia-Pacific users
    * **Multi-region deployment**: Better global performance but significantly higher cost and complexity
  - **Licensing**: Regional deployment options included in both Render and MongoDB Atlas services

## Coding Style Guide and Conventions

### Airbnb JavaScript Style Guide

The project adheres to the **Airbnb JavaScript Style Guide**, a comprehensive and widely-adopted coding standard that ensures code quality, consistency, and maintainability.

- **Industry Relevance**:
  - Developed and used by leading technology companies
  - Widely adopted in the JavaScript and Node.js ecosystem
  - Reflects best practices in modern JavaScript development

- **Purpose in Our Project**:
  - Enforces consistent code formatting
  - Prevents potential errors and anti-patterns
  - Improves code readability and maintainability

### ESLint Implementation

Our project leverages ESLint to automatically enforce the Airbnb JavaScript Style Guide:

```bash
# Installation of compatible packages
npm install --save-dev eslint@8 eslint-config-airbnb-base eslint-plugin-import
```

> **Important Note on Compatibility**: We specifically install ESLint v8 because the Airbnb config (`eslint-config-airbnb-base`) is currently compatible only with ESLint v8.x and has compatibility issues with ESLint v9.x.

#### Integration in Development Workflow

1. **NPM Scripts for Linting**
   ```json
   "scripts": {
     "lint": "eslint .",
     "lint:fix": "eslint . --fix"
   }
   ```

   **Running ESLint from the Command Line:**
   ```bash
   # Run ESLint on all files
   npx eslint .
   
   # Run ESLint with automatic fixing
   npx eslint . --fix
   
   # Run ESLint on a specific file or directory
   npx eslint controllers/userController.js
   ```

2. **Editor Integration**
   * VSCode ESLint extension configured for real-time feedback
   * Provides immediate visual feedback on code style issues
   * Allows quick fixes directly in the editor

3. **Manual Code Reviews**
   * Team members review code for style guide compliance
   * ESLint rules serve as objective criteria during reviews

The configuration file (.eslintrc.json) extends the Airbnb base configuration with project-specific customizations:

```json
{
  "extends": "airbnb-base",
  "env": {
    "node": true,
    "es6": true,
    "es2021": true,
    "jest": true
  },
  "plugins": ["import"],
  "rules": {
    "no-console": "off",
    "consistent-return": "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "next" }],
    "no-underscore-dangle": "off",
    "import/no-unresolved": ["error", { "commonjs": true }],
    "camelcase": [
      "error",
      {
        "properties": "never",
        "ignoreDestructuring": true,
        "ignoreImports": true,
        "allow": [
          "^brand_",
          "^first_",
          "^last_",
          "^street_",
          "^payment_",
          "^postal_",
          "^watch_",
          "^total_",
          "^user_",
          "^rental_"
        ]
      }
    ]
  }
}
```

### Naming Conventions

- **JavaScript Variables and Functions**: Use camelCase (e.g., `getUserProfile()`, `createRental()`)
- **Database and Schema Fields**: Use snake_case for database-related fields as configured in our ESLint rules (e.g., `first_name`, `watch_id`, `rental_status`)

**Reasoning for Flexible Naming**:
- Aligns with MongoDB's document-based structure
- Allows semantic grouping of related fields
- Maintains database-specific naming conventions
- Provides clarity in complex domain models

### Key Style Principles

1. **Consistent Formatting**
   - 2-space indentation
   - Descriptive variable and function names
   - Clear, concise code structure

2. **Error Handling**
   - Consistent approach to error management
   - Use of middleware for async error handling
   - Meaningful error messages

3. **Import and Module Management**
   - Organized import statements
   - Clear module exports
   - Minimal use of default exports

### Practical Implementation

**Model Design Example**:

```javascript
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  }
});
```

**Controller Example**:

```javascript
// Calculate rental dates and total price
const total_rental_price = watch.rental_day_price * rental_days;
const rental_start_date = new Date();
const rental_end_date = new Date();
rental_end_date.setDate(rental_start_date.getDate() + rental_days);

// Create rental
const rental = await Rental.create({
  user: req.user._id,
  watch: watch_id,
  rental_days,
  total_rental_price,
  rental_start_date,
  rental_end_date,
  rental_status: 'Pending',
});
```
## Project Dependencies

### Core Dependencies

1. **Express.js (v4.21.2)**
   - **Purpose**: Foundation of our API, handling all HTTP requests
     * Creates RESTful API endpoints for user authentication, watch management, and rental processing
     * Implements route handling for all business operations
     * Provides middleware support for authentication and error handling
     * Enables structured response formatting
   - **Alternatives Comparison**:
     * **Koa.js**: Lighter-weight with better async support, but smaller ecosystem and less middleware
     * **Fastify**: Better performance but steeper learning curve and smaller community
     * **Hapi.js**: More configuration-focused but slower performance for simple APIs
   - **Industry Relevance**: Most popular Node.js framework for web applications
   - **License**: MIT License

2. **MongoDB**
   - **Purpose**: NoSQL database for storing application data
     * Stores user profiles, watch inventory, rental records, and payment information
     * Enables flexible document structure for evolving business requirements
     * Provides high performance for read/write operations
     * Supports indexing for efficient querying
   - **Alternatives Comparison**:
     * **PostgreSQL**: Better for complex relations but less flexible for schema changes
     * **MySQL**: Stronger consistency guarantees but more rigid structure
     * **DynamoDB**: Fully managed with excellent scaling but vendor lock-in and less flexible querying
   - **Industry Relevance**: Leading NoSQL database for web applications
   - **License**: SSPL (Server Side Public License)

3. **Mongoose (v8.12.1)**
   - **Purpose**: Object Data Modeling (ODM) for MongoDB
     * Defines structured schemas for User, Watch, Brand, Rental, and Payment models
     * Validates data before saving to database
     * Implements middleware hooks for password hashing and payment date updates
     * Simplifies relationships between collections
     * Provides query building with chainable methods
   - **Alternatives Comparison**:
     * **MongoDB Driver (native)**: Higher performance but lacks schema validation and middleware
     * **Prisma**: Better TypeScript integration but less mature for MongoDB
     * **TypeORM**: Supports multiple databases but less optimized for MongoDB specifics
   - **Industry Relevance**: Standard ODM for MongoDB in Node.js applications
   - **License**: MIT License

4. **bcryptjs (v3.0.2)**
   - **Purpose**: Secure password hashing and comparison
     * Hashes user passwords before storage in database
     * Compares login attempts with stored hashed passwords
     * Implements salt rounds for enhanced security
     * Prevents plain text password storage
   - **Alternatives Comparison**:
     * **Argon2**: More secure against GPU attacks but less widely adopted
     * **Scrypt**: Better against hardware attacks but slower implementation
     * **Native crypto**: Built into Node.js but less specialized for password hashing
   - **Industry Relevance**: Industry standard for password security
   - **License**: MIT License

5. **jsonwebtoken (v9.0.2)**
   - **Purpose**: Authentication token generation and verification
     * Creates signed JWT tokens upon successful login
     * Verifies token validity in protect middleware
     * Extracts user information from tokens
     * Enables stateless authentication across API
     * Supports token expiration for security
   - **Alternatives Comparison**:
     * **Passport.js**: More comprehensive but adds complexity
     * **OAuth2**: Better for third-party authentication but significant overhead
     * **Session-based auth**: Better for sensitive applications but requires session storage
   - **Industry Relevance**: Standard for stateless authentication
   - **License**: MIT License

6. **dotenv (v16.4.7)**
   - **Purpose**: Environment configuration management
     * Loads environment variables from .env file
     * Manages different configurations for development and production
     * Secures sensitive information like database credentials and JWT secret
     * Simplifies deployment across environments
   - **Alternatives Comparison**:
     * **config**: More structured with hierarchical configs but additional complexity
     * **convict**: Better validation but steeper learning curve
     * **env-cmd**: CLI-focused approach but less integration with Node.js
   - **Industry Relevance**: Standard approach for configuration
   - **License**: BSD-2-Clause License

7. **helmet (v8.0.0)**
   - **Purpose**: HTTP header security
     * Sets security-related HTTP headers
     * Protects against XSS attacks
     * Prevents clickjacking
     * Implements Content Security Policy
     * Disables X-Powered-By header to hide technology stack
   - **Alternatives Comparison**:
     * **Custom middleware**: More control but requires security expertise
     * **express-security**: Less maintained with fewer features
     * **lusca**: Focused on specific security aspects but less comprehensive
   - **Industry Relevance**: Essential for API security
   - **License**: MIT License

8. **express-validator (v7.2.1)**
   - **Purpose**: Input validation and sanitization
     * Validates user registration data
     * Ensures proper input format for watch rentals and payments
     * Sanitizes input to prevent injection attacks
     * Provides consistent validation error responses
   - **Alternatives Comparison**:
     * **Joi**: More powerful validation but not Express-specific
     * **Yup**: Better TypeScript support but larger bundle size
     * **Zod**: Strong TypeScript integration but newer and less mature
   - **Industry Relevance**: Common in Express.js applications
   - **License**: MIT License

9. **cors (v2.8.5)**
   - **Purpose**: Cross-Origin Resource Sharing support
     * Configures allowed origins for frontend applications
     * Handles preflight requests for complex operations
     * Enables secure communication between frontend and backend
     * Restricts access from unauthorized domains
   - **Alternatives Comparison**:
     * **Custom middleware**: More control but requires CORS expertise
     * **express-cors**: Less maintained and fewer features
     * **API gateway**: Better for complex setups but adds infrastructure complexity
   - **Industry Relevance**: Essential for modern web APIs
   - **License**: MIT License

10. **express-async-handler (v1.2.0)**
    - **Purpose**: Simplifies async error handling in Express routes
      * Wraps async controller functions
      * Eliminates need for try/catch blocks in every controller
      * Forwards errors to the global error handler
      * Improves code readability and maintenance
    - **Alternatives Comparison**:
      * **try/catch blocks**: More explicit but verbose and repetitive
      * **express-promise-router**: Router-specific approach but less flexible
      * **async-middleware**: Similar functionality but less maintained
    - **Industry Relevance**: Standard solution for async error handling in Express
    - **License**: MIT License

### Development Dependencies

1. **Jest (v29.7.0)**
   - **Purpose**: Testing framework for unit and integration tests 
     * Runs automated tests for all API endpoints
     * Provides assertion libraries for validation
     * Enables mocking of database and external services
     * Generates test coverage reports
     * Supports isolated test environments
   - **Alternatives Comparison**:
     * **Mocha+Chai**: More flexible but requires more setup
     * **AVA**: Better for parallel tests but less ecosystem
     * **Jasmine**: Built-in assertion and mocking but less flexible
   - **Industry Relevance**: Standard for JavaScript testing
   - **License**: MIT License

2. **Supertest (v7.0.0)**
   - **Purpose**: HTTP assertion library for API testing
     * Simulates HTTP requests to test API endpoints
     * Verifies response status codes and content
     * Tests authentication and authorization flows
     * Validates data manipulation through API
   - **Alternatives Comparison**:
     * **Axios**: Simpler but requires more assertion code
     * **node-fetch**: Closer to browser fetch but less testing-focused
     * **got**: Feature-rich but requires more setup for testing
   - **Industry Relevance**: Common for HTTP testing
   - **License**: MIT License

3. **ESLint (v8.57.1)**
   - **Purpose**: Static code analysis and linting
     * Enforces Airbnb JavaScript style guide
     * Catches potential bugs and code quality issues
     * Ensures consistent coding practices across team
     * Integrates with IDE for real-time feedback
   - **Alternatives Comparison**:
     * **JSHint**: Simpler but less configurable and extensible
     * **StandardJS**: Zero configuration but less customizable
     * **Prettier**: Focuses on formatting rather than code quality
   - **Industry Relevance**: Standard for JavaScript linting
   - **License**: MIT License

4. **ESLint Airbnb Configuration (v15.0.0)**
   - **Purpose**: Provides industry-standard code style rules
     * Enforces consistent naming conventions
     * Standardizes code formatting and structure
     * Customized for our database naming conventions
     * Supports modern ECMAScript features
   - **Alternatives Comparison**:
     * **Standard**: Simpler rules but less comprehensive
     * **Google Style Guide**: More strict but less JavaScript-idiomatic
     * **XO**: Opinionated and strict but less widely adopted
   - **Industry Relevance**: Widely adopted style guide
   - **License**: MIT License

5. **ESLint Import Plugin (v2.31.0)**
   - **Purpose**: Validates module import/export patterns
     * Ensures proper module import organization
     * Prevents circular dependencies
     * Validates import paths
     * Enforces consistent import styles
   - **Alternatives Comparison**:
     * **eslint-plugin-simple-import-sort**: Focused on sorting but less validation
     * **eslint-plugin-unused-imports**: Only handles unused imports
     * **Manual rules**: Could configure individual rules but less comprehensive
   - **Industry Relevance**: Essential for modular code organization
   - **License**: MIT License

### Dependency Management

- **Package Manager**: npm
- **Version Control**: Specified in `package.json`
- **Key Scripts**:
  ```json
  "scripts": {
    "start": "NODE_ENV=production node src/index.js",
    "dev": "NODE_ENV=development node --watch src/index.js",
    "test": "jest --runInBand",
    "test:coverage": "jest --coverage"
  }
  ```
- **Alternatives Comparison**:
  * **Yarn**: Faster installation but requires additional tooling
  * **pnpm**: Better disk space usage but less mainstream adoption
  * **Bun**: Faster performance but newer with less compatibility
- **Note**: The project uses Node.js native `--watch` flag instead of nodemon for development
- **Installation**: `npm install`

## Application Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/luxury-watch-backend.git
cd luxury-watch-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the project root with the following values:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Start the Development Server
```bash
npm run dev
```
This starts the backend with **hot-reloading**.

### 5. Running Tests
To execute unit and integration tests:
```bash
npm run test
```

To run a specific test file:
```bash
npx jest src/tests/userController.test.js
```

#### Test Coverage
To generate and view test coverage reports:
```bash
# Generate coverage report
npx jest --coverage

# Generate coverage and open report in browser
npx jest --coverage --coverageReporters="html" && open coverage/index.html
```

### 6. Production Deployment
Deploy using **Render, AWS, or DigitalOcean**:
```bash
npm start
```

# API Endpoints

This document provides a complete list of all API endpoints available in the Timeless Watch Rental application.

## Base URLs

**Production:**
```
https://timeless-back-end.onrender.com/
```

**Development:**
```
http://localhost:5000/
```

## Authentication

Many endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## User Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/users/register` | Register a new user | Public |
| POST | `/api/users/login` | Login and get token | Public |
| GET | `/api/users/profile` | Get user profile | Private |
| PATCH | `/api/users/profile` | Update user profile | Private |
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| PATCH | `/api/users/role/:id` | Update user role | Admin |
| DELETE | `/api/users/:id` | Delete a user | Admin |

## Watch Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/watches` | Get all watches | Public |
| GET | `/api/watches/:id` | Get watch by ID | Public |
| POST | `/api/watches` | Create a new watch | Admin |
| PUT | `/api/watches/:id` | Update a watch | Admin |
| DELETE | `/api/watches/:id` | Delete a watch | Admin |

## Brand Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/brands` | Get all brands | Public |
| GET | `/api/brands/:id` | Get brand by ID | Public |
| POST | `/api/brands` | Create a new brand | Admin |
| PUT | `/api/brands/:id` | Update a brand | Admin |
| DELETE | `/api/brands/:id` | Delete a brand | Admin |

## Rental Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/rentals` | Create a new rental | Private |
| GET | `/api/rentals/:id` | Get rental by ID | Private |
| GET | `/api/rentals` | Get all rentals | Admin |
| PATCH | `/api/rentals/:id` | Update rental status | Admin |
| DELETE | `/api/rentals/:id` | Delete a rental | Admin |

## Payment Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/payments` | Create a new payment | Private |
| GET | `/api/payments/user/me` | Get user's payments | Private |
| GET | `/api/payments/:id` | Get payment by ID | Private |
| GET | `/api/payments` | Get all payments | Admin |
| PATCH | `/api/payments/:id` | Update payment status | Admin |
| DELETE | `/api/payments/:id` | Delete a payment | Admin |

## Address Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/addresses` | Create a new address | Private |
| GET | `/api/addresses/:id` | Get address by ID | Private |
| PATCH | `/api/addresses/:id` | Update an address | Private |
| DELETE | `/api/addresses/:id` | Delete an address | Private |
| GET | `/api/addresses` | Get all addresses | Admin |

## Access Levels

- **Public**: Accessible without authentication
- **Private**: Requires user authentication (valid JWT token)
- **Admin**: Requires admin role privileges


# Trigger