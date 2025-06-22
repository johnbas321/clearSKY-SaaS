-- db_init.sql
-- Database initialization script for Review microservice

CREATE DATABASE IF NOT EXISTS review CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE review;

CREATE TABLE IF NOT EXISTS requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(50) NOT NULL,
    time_period VARCHAR(50) NOT NULL,
    student_id INT NOT NULL,
    student_name VARCHAR(50) NOT NULL,
    instructor_id INT NOT NULL,
    request_message TEXT NOT NULL,
    request_state ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (course_name, time_period, student_id),
    INDEX idx_instructor_id (instructor_id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS replies (
    request_id INT NOT NULL,
    student_name VARCHAR(50) NOT NULL,
    reply_message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (request_id),
    FOREIGN KEY (request_id) REFERENCES requests(request_id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;