
const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pharmayush_hr',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Enable JSON parsing for JSON columns automatically
  typeCast: function (field, next) {
    if (field.type === 'JSON') {
      return (JSON.parse(field.string()));
    }
    return next();
  }
});

module.exports = pool.promise();
