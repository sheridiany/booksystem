-- 众慧图书借阅系统 - 完全重置并初始化数据库
-- 用途: 删除所有旧表，重新创建正确的表结构
-- 创建时间: 2025-11-02
-- ⚠️ 警告: 这将删除所有现有数据！

-- ========== 1. 删除所有旧表（按依赖顺序） ==========
DROP TABLE IF EXISTS gz_books.borrow_records CASCADE;
DROP TABLE IF EXISTS gz_books.book_copies CASCADE;
DROP TABLE IF EXISTS gz_books.books CASCADE;
DROP TABLE IF EXISTS gz_books.readers CASCADE;
DROP TABLE IF EXISTS gz_books.file_metadata CASCADE;
DROP TABLE IF EXISTS gz_books.categories CASCADE;
DROP TABLE IF EXISTS gz_books.users CASCADE;

-- 删除可能存在的旧函数
DROP FUNCTION IF EXISTS gz_books.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS gz_books.generate_simple_uuid() CASCADE;

-- ========== 2. 创建辅助函数 ==========

-- UUID 生成函数
CREATE OR REPLACE FUNCTION gz_books.generate_simple_uuid()
RETURNS TEXT AS $$
DECLARE
  uuid_str TEXT;
BEGIN
  uuid_str := MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT || RANDOM()::TEXT);
  RETURN uuid_str;
END;
$$ LANGUAGE plpgsql;

-- 更新时间触发器函数
CREATE OR REPLACE FUNCTION gz_books.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========== 3. 创建用户表 ==========
CREATE TABLE gz_books.users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON gz_books.users
    FOR EACH ROW EXECUTE FUNCTION gz_books.update_updated_at_column();

-- ========== 4. 创建读者表 ==========
CREATE TABLE gz_books.readers (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    student_id TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'ACTIVE' NOT NULL,
    max_borrow_limit INTEGER DEFAULT 5 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES gz_books.users(id) ON DELETE CASCADE
);

CREATE TRIGGER update_readers_updated_at BEFORE UPDATE ON gz_books.readers
    FOR EACH ROW EXECUTE FUNCTION gz_books.update_updated_at_column();

-- ========== 5. 创建分类表 ==========
CREATE TABLE gz_books.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,
    sort INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON gz_books.categories
    FOR EACH ROW EXECUTE FUNCTION gz_books.update_updated_at_column();

-- ========== 6. 创建文件元数据表 ==========
CREATE TABLE gz_books.file_metadata (
    id TEXT PRIMARY KEY,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========== 7. 创建图书表（元信息，不包含库存） ==========
CREATE TABLE gz_books.books (
    id TEXT PRIMARY KEY,
    isbn TEXT UNIQUE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    publisher TEXT NOT NULL,
    category_id TEXT NOT NULL,
    cover_file_id TEXT,
    description TEXT,
    publish_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (category_id) REFERENCES gz_books.categories(id),
    FOREIGN KEY (cover_file_id) REFERENCES gz_books.file_metadata(id)
);

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON gz_books.books
    FOR EACH ROW EXECUTE FUNCTION gz_books.update_updated_at_column();

CREATE INDEX idx_books_category_id ON gz_books.books(category_id);
CREATE INDEX idx_books_title ON gz_books.books(title);

-- ========== 8. 创建图书载体表（纸质书/电子书） ==========
CREATE TABLE gz_books.book_copies (
    id TEXT PRIMARY KEY,
    book_id TEXT NOT NULL,
    type TEXT NOT NULL,  -- PHYSICAL | EBOOK
    status TEXT DEFAULT 'AVAILABLE' NOT NULL,  -- AVAILABLE | UNAVAILABLE | MAINTENANCE

    -- 纸质书字段
    total_copies INTEGER,
    available_copies INTEGER,
    location TEXT,

    -- 电子书字段
    ebook_format TEXT,
    file_id TEXT,
    file_size INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (book_id) REFERENCES gz_books.books(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES gz_books.file_metadata(id)
);

CREATE TRIGGER update_book_copies_updated_at BEFORE UPDATE ON gz_books.book_copies
    FOR EACH ROW EXECUTE FUNCTION gz_books.update_updated_at_column();

CREATE INDEX idx_book_copies_book_id ON gz_books.book_copies(book_id);
CREATE INDEX idx_book_copies_type ON gz_books.book_copies(type);
CREATE INDEX idx_book_copies_status ON gz_books.book_copies(status);

-- ========== 9. 创建借阅记录表 ==========
CREATE TABLE gz_books.borrow_records (
    id TEXT PRIMARY KEY,
    book_copy_id TEXT NOT NULL,
    reader_id TEXT NOT NULL,
    borrow_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP,
    return_date TIMESTAMP,
    renew_count INTEGER DEFAULT 0 NOT NULL,
    status TEXT NOT NULL,  -- BORROWED | RETURNED | OVERDUE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (book_copy_id) REFERENCES gz_books.book_copies(id),
    FOREIGN KEY (reader_id) REFERENCES gz_books.readers(id)
);

CREATE TRIGGER update_borrow_records_updated_at BEFORE UPDATE ON gz_books.borrow_records
    FOR EACH ROW EXECUTE FUNCTION gz_books.update_updated_at_column();

CREATE INDEX idx_borrow_records_reader_id ON gz_books.borrow_records(reader_id);
CREATE INDEX idx_borrow_records_book_copy_id ON gz_books.borrow_records(book_copy_id);
CREATE INDEX idx_borrow_records_status ON gz_books.borrow_records(status);

-- ========== 完成 ==========
SELECT '✓ 数据库表结构创建成功！' as message;
SELECT '⚠️ 注意：所有旧数据已被清除' as warning;
SELECT '→ 下一步：执行 seed-opengauss.sql 导入测试数据' as next_step;
