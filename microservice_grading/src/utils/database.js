import mysql from 'mysql2/promise';
import { dbConfig } from '../config.js';

const pool = mysql.createPool(dbConfig);

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

export const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Close pool (for graceful shutdown)
export const closePool = async () => {
  await pool.end();
  console.log('Database pool closed');
};

export default pool;