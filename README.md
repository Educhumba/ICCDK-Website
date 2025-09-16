CREATE DATABASE ICCDK_DATABASE;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    verification_code VARCHAR(10),
    role ENUM('admin', 'superadmin') DEFAULT 'admin',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    status ENUM('past', 'ongoing', 'upcoming') DEFAULT 'upcoming',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    organization VARCHAR(150),
    category VARCHAR(100),
    message TEXT,
    date DATE NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('new', 'reviewed', 'archived') DEFAULT 'new'
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(200),
    message TEXT,
    date DATE NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('new', 'reviewed', 'archived') DEFAULT 'new'
);

CREATE TABLE pdf_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category ENUM('annual_report', 'newsletter', 'economic_study') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    published_date DATE NOT NULL,
    author_id INT,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    last_activity DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
