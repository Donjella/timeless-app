const dotenv = require('dotenv');
const { app } = require('./server');
const { databaseConnect } = require('./database');

// Load environment variables
dotenv.config();

// Use port 8080 for Google Cloud Run
const PORT = process.env.PORT || 8080;

// Connect to the database before starting the server
databaseConnect()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Stop the server if the database fails to connect
  });