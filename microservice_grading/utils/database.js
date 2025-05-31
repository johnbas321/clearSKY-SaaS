import mysql from 'mysql2/promise';

export const db = mysql.createPool({
    host: 'localhost',
    user: 'clearsky',
    password: 'password',
    database: 'grading',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });