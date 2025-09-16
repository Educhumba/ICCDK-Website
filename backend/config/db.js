const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,       // Database name
  process.env.DB_USER,       // Username
  process.env.DB_PASSWORD,   // Password
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }
})();

module.exports = sequelize;
