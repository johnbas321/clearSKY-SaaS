-- db_init.sql
-- Database initialization script for Courses/Grading microservice

CREATE DATABASE IF NOT EXISTS grading CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE grading;

-- Create users table
CREATE TABLE IF NOT EXISTS courses (
    id INT NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    instructor_id INT  NOT NULL,
    time_period VARCHAR(50) NOT NULL,
    grade_state ENUM('VOID', 'OPEN', 'FINAL') NOT NULL DEFAULT 'VOID',
    initial_grades_at DATE DEFAULT (CURRENT_DATE),
    final_grades_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id, time_period),
    INDEX idx_course_name (course_name),
    INDEX grade_state (grade_state)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS grades (
    course_id INT NOT NULL,
    time_period VARCHAR(50) NOT NULL,
    student_id INT NOT NULL,
    grade INT NOT NULL,
    grades_per_question VARCHAR(255) NULL,
    is_final BOOLEAN NOT NULL DEFAULT FALSE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (course_id, time_period, student_id),
    FOREIGN KEY (course_id, time_period) REFERENCES courses(id, time_period) ON DELETE CASCADE,
    INDEX idx_grade (grade),
    INDEX idx_grades_per_question (grades_per_question)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;