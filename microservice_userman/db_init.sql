-- db_init.sql
-- Database initialization script for User Management microservice

CREATE DATABASE IF NOT EXISTS userman;
USE userman;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'institution_admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

INSERT INTO users (id, full_name, email, password_salt, password_hash, role)
VALUES(
    00000,
    'admin',
    'admin@clearsky.com',
    '97aefa820d62cdb9be7bd1e1e5f24938',
    '7adaba39c2a271f4e5a1c6d22676a6707df0c066087d7c918cf18e045ddaf7a9c32eae9ec9df212a8bcdeba68848b55a10fad79bfc6e9fc177026bee608dac1c',
    'institution_admin'
)