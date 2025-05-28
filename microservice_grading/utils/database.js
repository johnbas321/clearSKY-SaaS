import mysql from 'mysql2/promise';

export const db = mysql.createPool({
    host: 'localhost',
    user: 'your_user',
    password: 'your_password',
    database: 'clearsky',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });