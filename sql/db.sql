-- CREATE DATABASE IF NOT EXISTS clearsky;
-- USE clearsky;

CREATE TABLE institutions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email_domain VARCHAR(255) NOT NULL,
    credits INT DEFAULT 0
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institution_id INT,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE
);

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(8) NOT NULL,
    instructor_id INT,
    institution_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE
);

CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    course_id INT,
    UNIQUE KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT,
    initial_grade INT,
    final_grade INT,
    CHECK (initial_grade > 0 AND initial_grade <= 10),
    CHECK (final_grade > 0 AND final_grade <= 10),
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

CREATE TABLE review_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT,
    reason TEXT NOT NULL,
    response TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

CREATE TABLE user_logins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE OR REPLACE VIEW course_statistics AS
SELECT
    c.id AS course_id,
    c.title,
    COUNT(e.id) AS total_students,
    AVG(g.final_grade) AS average_final_grade
FROM courses c
JOIN enrollments e ON c.id = e.course_id
JOIN grades g ON g.enrollment_id = e.id
GROUP BY c.id, c.title;
