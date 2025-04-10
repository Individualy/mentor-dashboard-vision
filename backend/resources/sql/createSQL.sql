-- Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS mentor_dashboard;
USE mentor_dashboard;

-- Tạo bảng User
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

-- Tạo bảng Class
CREATE TABLE Class (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id INT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES User(id) ON DELETE CASCADE
);

-- Tạo bảng Meeting
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

-- Tạo bảng StudentClass (Nhiều-Nhiều giữa Sinh viên và Lớp)
CREATE TABLE StudentClass (
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, class_id),
    FOREIGN KEY (student_id) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES Class(id) ON DELETE CASCADE
);

-- Tạo bảng EmotionData để theo dõi cảm xúc
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

-- Tạo bảng MeetingAttendance (Không dùng GENERATED AS)
CREATE TABLE MeetingAttendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    student_id INT NOT NULL,
    join_time DATETIME,
    leave_time DATETIME,
    duration_minutes INT, -- Sẽ cập nhật qua truy vấn hoặc trigger
    FOREIGN KEY (meeting_id) REFERENCES Meeting(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES User(id) ON DELETE CASCADE,
    UNIQUE KEY unique_meeting_student (meeting_id, student_id)
);

-- Tạo trigger để tính duration_minutes nếu cần
DELIMITER $$

CREATE TRIGGER before_insert_meeting_attendance
BEFORE INSERT ON MeetingAttendance
FOR EACH ROW
BEGIN
    IF NEW.leave_time IS NOT NULL THEN
        SET NEW.duration_minutes = TIMESTAMPDIFF(MINUTE, NEW.join_time, NEW.leave_time);
    END IF;
END$$

DELIMITER ;

-- Tạo bảng MeetingChat (tin nhắn trong cuộc họp)
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

-- Tạo các index để tối ưu truy vấn
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_user_role ON User(role);
CREATE INDEX idx_class_teacher ON Class(teacher_id);
CREATE INDEX idx_meeting_class ON Meeting(class_id);
CREATE INDEX idx_meeting_time ON Meeting(start_time, end_time);
CREATE INDEX idx_emotion_student ON EmotionData(student_id);
CREATE INDEX idx_emotion_meeting ON EmotionData(meeting_id);
CREATE INDEX idx_attendance_meeting ON MeetingAttendance(meeting_id);
CREATE INDEX idx_attendance_student ON MeetingAttendance(student_id);
