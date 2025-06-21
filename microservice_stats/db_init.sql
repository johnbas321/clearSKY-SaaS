-- db_init.sql
-- Database initialization script for Courses/Grading microservice

CREATE DATABASE IF NOT EXISTS stats CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE stats;

CREATE TABLE IF NOT EXISTS stats (
    course_id INT NOT NULL,
    time_period VARCHAR(50) NOT NULL,
    distribution JSON NOT NULL,
    is_final BOOLEAN NOT NULL DEFAULT FALSE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (course_id, time_period),
    INDEX idx_is_final (is_final)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;