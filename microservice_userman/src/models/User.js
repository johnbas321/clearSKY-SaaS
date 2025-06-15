import { executeQuery } from '../config/database.js';
import crypto from 'crypto';
import util from 'util';

const scrypt = util.promisify(crypto.scrypt);

export class User {
  constructor(data = {}) {
    this.id = data.id;
    this.full_name = data.full_name;
    this.email = data.email;
    this.password_salt = data.password_salt;
    this.password_hash = data.password_hash;
    this.role = data.role || 'STUDENT';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create new user
  static async create(userData) {
    const { id, full_name, email, password, role = 'STUDENT' } = userData;

    const password_salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = await scrypt(password, password_salt, 64);
    const password_hash = derivedKey.toString('hex');

    const query = `
      INSERT INTO users (id, full_name, email, password_salt, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const result = await executeQuery(query, [id, full_name, email, password_salt, password_hash, role]);
      const newUser = await User.findById(result.insertId);
      return newUser;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const result = await executeQuery(query, [id]);
    
    if (result.length === 0) {
      return null;
    }
    
    return new User(result[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const result = await executeQuery(query, [email]);
    
    if (result.length === 0) {
      return null;
    }
    
    return new User(result[0]);
  }

  // Get all users with optional filters
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM users';
    const params = [];
    const conditions = [];

    if (filters.role) {
      conditions.push('role = ?');
      params.push(filters.role);
    }

    if (filters.search) {
      conditions.push('(full_name LIKE ? OR email LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const result = await executeQuery(query, params);
    return result.map(userData => new User(userData));
  }

  // Update user
  static async update(id, updateData) {
    const allowedFields = ['full_name', 'email', 'password_salt', 'password_hash', 'role'];
    const updates = [];
    const params = [];

    // Build dynamic update query
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    params.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    try {
      const result = await executeQuery(query, params);
      
      if (result.affectedRows === 0) {
        return null;
      }

      return await User.findById(id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const result = await executeQuery(query, [id]);
    
    return result.affectedRows > 0;
  }

  // Get user count by role
  static async getCountByRole() {
    const query = `
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `;
    
    const result = await executeQuery(query);
    return result.reduce((acc, row) => {
      acc[row.role.toLowerCase()] = row.count;
      return acc;
    }, {});
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    const { password_salt, password_hash, ...publicData } = this;
    return publicData;
  }

  // Convert to JSON including sensitive data (for internal use)
  toJSONWithAuth() {
    return {
      id: this.id,
      full_name: this.full_name,
      email: this.email,
      password_salt: this.password_salt,
      password_hash: this.password_hash,
      role: this.role,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}