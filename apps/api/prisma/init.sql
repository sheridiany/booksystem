-- 高斯图书借阅系统 - 数据库初始化脚本
-- 兼容 openGauss

-- 创建 schema
CREATE SCHEMA IF NOT EXISTS gz_books;
SET search_path TO gz_books;

-- ========== 用户表 ==========
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 读者表 ==========
CREATE TABLE IF NOT EXISTS readers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    student_id VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    max_borrow_limit INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========== 图书分类表 ==========
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id VARCHAR(36),
    sort INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 文件元数据表 ==========
CREATE TABLE IF NOT EXISTS file_metadata (
    id VARCHAR(36) PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    uploaded_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 图书表 ==========
CREATE TABLE IF NOT EXISTS books (
    id VARCHAR(36) PRIMARY KEY,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(255) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    total_copies INTEGER NOT NULL,
    available_copies INTEGER NOT NULL,
    cover_file_id VARCHAR(36),
    content_file_id VARCHAR(36),
    description TEXT,
    publish_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (cover_file_id) REFERENCES file_metadata(id),
    FOREIGN KEY (content_file_id) REFERENCES file_metadata(id)
);

CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);

-- ========== 借阅记录表 ==========
CREATE TABLE IF NOT EXISTS borrow_records (
    id VARCHAR(36) PRIMARY KEY,
    book_id VARCHAR(36) NOT NULL,
    reader_id VARCHAR(36) NOT NULL,
    borrow_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP,
    renew_count INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (reader_id) REFERENCES readers(id)
);

CREATE INDEX IF NOT EXISTS idx_borrow_reader ON borrow_records(reader_id);
CREATE INDEX IF NOT EXISTS idx_borrow_book ON borrow_records(book_id);
CREATE INDEX IF NOT EXISTS idx_borrow_status ON borrow_records(status);

-- ========== 初始数据 ==========

-- 1. 创建默认管理员用户 (密码: admin123, 使用bcrypt hash)
INSERT INTO users (id, username, password_hash, role, is_active, created_at, updated_at)
VALUES (
    'admin-001',
    'admin',
    '$2b$10$YourBcryptHashHere', -- 需要替换为实际的bcrypt hash
    'ADMIN',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (username) DO NOTHING;

-- 2. 创建默认分类
INSERT INTO categories (id, name, parent_id, sort, created_at, updated_at) VALUES
('cat-001', '文学', NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-002', '历史', NULL, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-003', '科技', NULL, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-004', '艺术', NULL, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 完成
SELECT 'Database initialized successfully!' AS message;
