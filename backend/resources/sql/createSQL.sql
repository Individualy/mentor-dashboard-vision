
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
    teacher_id INT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES User(id) ON DELETE CASCADE
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
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, class_id),
    FOREIGN KEY (student_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Class(id) ON DELETE CASCADE
);

-- Create the Emotion data table to track student emotions during meetings
CREATE TABLE EmotionData (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    meeting_id INT NOT NULL,
    emotion_type ENUM('happy', 'confused', 'bored', 'engaged', 'frustrated') NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_id) REFERENCES Meeting(id) ON DELETE CASCADE
);

-- Create table for meeting attendance
CREATE TABLE MeetingAttendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    student_id INT NOT NULL,
    join_time DATETIME,
    leave_time DATETIME,
    duration_minutes INT GENERATED ALWAYS AS 
        (TIMESTAMPDIFF(MINUTE, join_time, IFNULL(leave_time, CURRENT_TIMESTAMP))) STORED,
    FOREIGN KEY (meeting_id) REFERENCES Meeting(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES User(id) ON DELETE CASCADE,
    UNIQUE KEY unique_meeting_student (meeting_id, student_id)
);

-- Create table for messages sent during meetings
CREATE TABLE MeetingChat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_private BOOLEAN DEFAULT FALSE,
    recipient_id INT,
    FOREIGN KEY (meeting_id) REFERENCES Meeting(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES User(id) ON DELETE SET NULL
);

-- Create indexes for faster queries
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_role ON User(role);
CREATE INDEX idx_class_teacher ON Class(teacher_id);
CREATE INDEX idx_meeting_class ON Meeting(class_id);
CREATE INDEX idx_meeting_time ON Meeting(start_time, end_time);
CREATE INDEX idx_emotion_student ON EmotionData(student_id);
CREATE INDEX idx_emotion_meeting ON EmotionData(meeting_id);
CREATE INDEX idx_attendance_meeting ON MeetingAttendance(meeting_id);
CREATE INDEX idx_attendance_student ON MeetingAttendance(student_id);

-- Insert sample data for testing
-- Insert admin user
INSERT INTO User (full_name, email, password, role, is_active) 
VALUES ('Admin User', 'admin@example.com', '$2b$12$1tJQ1pamVGlSvrKjJT7TmuQl4/uEnDGfR0l9IzX1vi1.OoZ1pJBCa', 'admin', TRUE);

-- Insert teacher user
INSERT INTO User (full_name, email, password, role, is_active) 
VALUES ('Teacher User', 'teacher@example.com', '$2b$12$1tJQ1pamVGlSvrKjJT7TmuQl4/uEnDGfR0l9IzX1vi1.OoZ1pJBCa', 'teacher', TRUE);

-- Insert student user
INSERT INTO User (full_name, email, password, role, is_active) 
VALUES ('Student User', 'student@example.com', '$2b$12$1tJQ1pamVGlSvrKjJT7TmuQl4/uEnDGfR0l9IzX1vi1.OoZ1pJBCa', 'student', TRUE);

-- Insert sample class
INSERT INTO Class (name, description, teacher_id) 
VALUES ('Mathematics', 'Advanced calculus and algebra', 2);

-- Insert sample meeting
INSERT INTO Meeting (title, start_time, end_time, link, class_id)
VALUES ('Calculus Introduction', 
        DATE_ADD(NOW(), INTERVAL 1 DAY), 
        DATE_ADD(NOW(), INTERVAL 1 DAY) + INTERVAL 1 HOUR, 
        'https://meet.google.com/sample-link', 
        1);

-- Enroll student in class
INSERT INTO StudentClass (student_id, class_id)
VALUES (3, 1);

-- Sample emotion data
INSERT INTO EmotionData (student_id, meeting_id, emotion_type, notes)
VALUES (3, 1, 'engaged', 'Student was actively participating');
