-- Create the database
CREATE DATABASE IF NOT EXISTS mentor_dashboard;

-- Use the database
USE mentor_dashboard;

-- Create the User table
CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(36),
    token_expiry DATETIME,
    last_email_sent DATETIME
);

-- Create the Class table
CREATE TABLE Class (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id INT,
    FOREIGN KEY (teacher_id) REFERENCES User(id) ON DELETE SET NULL
);

-- Create the Meeting table
CREATE TABLE Meeting (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    link VARCHAR(255),
    class_id INT NOT NULL,
    FOREIGN KEY (class_id) REFERENCES Class(id) ON DELETE CASCADE,
    CHECK (end_time > start_time)
);

-- Create the StudentClass table (Many-to-Many relationship between Student and Class)
CREATE TABLE StudentClass (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Class(id) ON DELETE CASCADE
);

-- Create the Emotion data 
CREATE TABLE EmotionData(
	id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    EmotionType NVARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES User(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_class_teacher ON Class(teacher_id);
CREATE INDEX idx_meeting_class ON Meeting(class_id);

SELECT * FROM User;
INSERT INTO Class (id, name) VALUES (1, 'Mathematics');
SELECT * FROM Class;
Select * From Meeting;
