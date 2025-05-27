const { default: mongoose } = require('mongoose');

async function databaseConnect(targetDatabaseURL = null) {
  console.log('Starting database connection!');
  const actualDatabaseURL = targetDatabaseURL || process.env.DATABASE_URL || process.env.DATABASE_URI || 'some fallback url goes here';
  console.log("Connecting to:", actualDatabaseURL);
  await mongoose.connect(actualDatabaseURL);
}

async function databaseDisconnect() {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw error;
  }
}

module.exports = {
  databaseConnect, databaseDisconnect,
};
