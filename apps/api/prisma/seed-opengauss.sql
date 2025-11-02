-- 众慧图书借阅系统 - 测试数据脚本 (openGauss 完全兼容版)
-- 创建时间: 2025-11-02
-- 用途: 初始化测试用户和基础数据
-- 兼容: openGauss (不使用 gen_random_uuid)

-- ========== 辅助函数：生成简单 UUID ==========
-- openGauss 可能没有 gen_random_uuid，使用简单方法生成唯一ID
CREATE OR REPLACE FUNCTION gz_books.generate_simple_uuid()
RETURNS TEXT AS $$
DECLARE
  uuid_str TEXT;
BEGIN
  -- 使用时间戳 + 随机数生成唯一ID（32位十六进制字符串）
  uuid_str := MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT || RANDOM()::TEXT);
  RETURN uuid_str;
END;
$$ LANGUAGE plpgsql;

-- ========== 1. 清空现有数据 (可选) ==========
-- 警告: 这将删除所有数据!
-- 如果需要清空数据，取消注释以下行：
-- TRUNCATE TABLE gz_books.borrow_records CASCADE;
-- TRUNCATE TABLE gz_books.book_copies CASCADE;
-- TRUNCATE TABLE gz_books.books CASCADE;
-- TRUNCATE TABLE gz_books.readers CASCADE;
-- TRUNCATE TABLE gz_books.users CASCADE;
-- TRUNCATE TABLE gz_books.categories CASCADE;
-- TRUNCATE TABLE gz_books.file_metadata CASCADE;

-- ========== 2. 创建测试用户 ==========

-- 管理员账户
-- 用户名: admin
-- 密码: admin123
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM gz_books.users WHERE username = 'admin') THEN
    INSERT INTO gz_books.users (id, username, password_hash, role, is_active, created_at, updated_at)
    VALUES (
      gz_books.generate_simple_uuid(),
      'admin',
      '$2b$10$E5HN.3VSpylyuBNrgoxzIOF42q8QXw3nN5ulo02kbu80mq/TgFT7C',
      'ADMIN',
      true,
      NOW(),
      NOW()
    );
    RAISE NOTICE '✓ 已创建管理员账户: admin';
  ELSE
    RAISE NOTICE '⊙ 管理员账户已存在: admin';
  END IF;
END $$;

-- 测试读者账户
-- 用户名: reader
-- 密码: reader123
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM gz_books.users WHERE username = 'reader') THEN
    INSERT INTO gz_books.users (id, username, password_hash, role, is_active, created_at, updated_at)
    VALUES (
      gz_books.generate_simple_uuid(),
      'reader',
      '$2b$10$E5HN.3VSpylyuBNrgoxzIOF42q8QXw3nN5ulo02kbu80mq/TgFT7C',
      'READER',
      true,
      NOW(),
      NOW()
    );
    RAISE NOTICE '✓ 已创建读者账户: reader';
  ELSE
    RAISE NOTICE '⊙ 读者账户已存在: reader';
  END IF;
END $$;

-- ========== 3. 创建默认分类 ==========

DO $$
BEGIN
  -- 文学
  IF NOT EXISTS (SELECT 1 FROM gz_books.categories WHERE name = '文学') THEN
    INSERT INTO gz_books.categories (id, name, sort, created_at, updated_at)
    VALUES (gz_books.generate_simple_uuid(), '文学', 1, NOW(), NOW());
    RAISE NOTICE '✓ 已创建分类: 文学';
  END IF;

  -- 历史
  IF NOT EXISTS (SELECT 1 FROM gz_books.categories WHERE name = '历史') THEN
    INSERT INTO gz_books.categories (id, name, sort, created_at, updated_at)
    VALUES (gz_books.generate_simple_uuid(), '历史', 2, NOW(), NOW());
    RAISE NOTICE '✓ 已创建分类: 历史';
  END IF;

  -- 科技
  IF NOT EXISTS (SELECT 1 FROM gz_books.categories WHERE name = '科技') THEN
    INSERT INTO gz_books.categories (id, name, sort, created_at, updated_at)
    VALUES (gz_books.generate_simple_uuid(), '科技', 3, NOW(), NOW());
    RAISE NOTICE '✓ 已创建分类: 科技';
  END IF;

  -- 教育
  IF NOT EXISTS (SELECT 1 FROM gz_books.categories WHERE name = '教育') THEN
    INSERT INTO gz_books.categories (id, name, sort, created_at, updated_at)
    VALUES (gz_books.generate_simple_uuid(), '教育', 4, NOW(), NOW());
    RAISE NOTICE '✓ 已创建分类: 教育';
  END IF;

  -- 艺术
  IF NOT EXISTS (SELECT 1 FROM gz_books.categories WHERE name = '艺术') THEN
    INSERT INTO gz_books.categories (id, name, sort, created_at, updated_at)
    VALUES (gz_books.generate_simple_uuid(), '艺术', 5, NOW(), NOW());
    RAISE NOTICE '✓ 已创建分类: 艺术';
  END IF;
END $$;

-- ========== 4. 创建测试图书 (可选) ==========

DO $$
DECLARE
  literature_cat_id TEXT;
  history_cat_id TEXT;
  tech_cat_id TEXT;
  book1_id TEXT;
  book2_id TEXT;
  book3_id TEXT;
BEGIN
  -- 获取分类ID
  SELECT id INTO literature_cat_id FROM gz_books.categories WHERE name = '文学' LIMIT 1;
  SELECT id INTO history_cat_id FROM gz_books.categories WHERE name = '历史' LIMIT 1;
  SELECT id INTO tech_cat_id FROM gz_books.categories WHERE name = '科技' LIMIT 1;

  -- 创建图书 1: 红楼梦
  IF NOT EXISTS (SELECT 1 FROM gz_books.books WHERE isbn = '9787020002207') THEN
    book1_id := gz_books.generate_simple_uuid();

    INSERT INTO gz_books.books (id, isbn, title, author, publisher, category_id, description, publish_date, created_at, updated_at)
    VALUES (
      book1_id,
      '9787020002207',
      '红楼梦',
      '曹雪芹',
      '人民文学出版社',
      literature_cat_id,
      '中国古典四大名著之首，描绘贾宝玉、林黛玉等人的爱情悲剧。',
      '1996-12-01'::TIMESTAMP,
      NOW(),
      NOW()
    );

    -- 创建对应的纸质书载体
    INSERT INTO gz_books.book_copies (
      id, book_id, type, status, total_copies, available_copies, location, created_at, updated_at
    )
    VALUES (
      gz_books.generate_simple_uuid(),
      book1_id,
      'PHYSICAL',
      'AVAILABLE',
      10,
      10,
      'A区-001架',
      NOW(),
      NOW()
    );

    RAISE NOTICE '✓ 已创建图书: 红楼梦';
  END IF;

  -- 创建图书 2: 史记
  IF NOT EXISTS (SELECT 1 FROM gz_books.books WHERE isbn = '9787101003048') THEN
    book2_id := gz_books.generate_simple_uuid();

    INSERT INTO gz_books.books (id, isbn, title, author, publisher, category_id, description, publish_date, created_at, updated_at)
    VALUES (
      book2_id,
      '9787101003048',
      '史记',
      '司马迁',
      '中华书局',
      history_cat_id,
      '中国第一部纪传体通史，记载了从黄帝到汉武帝三千年的历史。',
      '1959-09-01'::TIMESTAMP,
      NOW(),
      NOW()
    );

    INSERT INTO gz_books.book_copies (
      id, book_id, type, status, total_copies, available_copies, location, created_at, updated_at
    )
    VALUES (
      gz_books.generate_simple_uuid(),
      book2_id,
      'PHYSICAL',
      'AVAILABLE',
      5,
      5,
      'A区-002架',
      NOW(),
      NOW()
    );

    RAISE NOTICE '✓ 已创建图书: 史记';
  END IF;

  -- 创建图书 3: 算法导论
  IF NOT EXISTS (SELECT 1 FROM gz_books.books WHERE isbn = '9787111407010') THEN
    book3_id := gz_books.generate_simple_uuid();

    INSERT INTO gz_books.books (id, isbn, title, author, publisher, category_id, description, publish_date, created_at, updated_at)
    VALUES (
      book3_id,
      '9787111407010',
      '算法导论',
      'Thomas H. Cormen',
      '机械工业出版社',
      tech_cat_id,
      '计算机科学经典教材，全面介绍算法设计与分析。',
      '2013-01-01'::TIMESTAMP,
      NOW(),
      NOW()
    );

    INSERT INTO gz_books.book_copies (
      id, book_id, type, status, total_copies, available_copies, location, created_at, updated_at
    )
    VALUES (
      gz_books.generate_simple_uuid(),
      book3_id,
      'PHYSICAL',
      'AVAILABLE',
      3,
      3,
      'B区-101架',
      NOW(),
      NOW()
    );

    RAISE NOTICE '✓ 已创建图书: 算法导论';
  END IF;

END $$;

-- ========== 5. 验证数据 ==========

-- 显示统计信息
DO $$
DECLARE
  user_count INT;
  category_count INT;
  book_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM gz_books.users;
  SELECT COUNT(*) INTO category_count FROM gz_books.categories;
  SELECT COUNT(*) INTO book_count FROM gz_books.books;

  RAISE NOTICE '========================================';
  RAISE NOTICE '数据初始化完成！';
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE '用户数: %', user_count;
  RAISE NOTICE '分类数: %', category_count;
  RAISE NOTICE '图书数: %', book_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '测试账号:';
  RAISE NOTICE '  管理员 - admin / admin123';
  RAISE NOTICE '  读者   - reader / reader123';
  RAISE NOTICE '========================================';
END $$;

-- 查看创建的用户
SELECT
  id,
  username,
  role,
  is_active,
  created_at
FROM gz_books.users
ORDER BY created_at;

-- 查看创建的分类
SELECT
  id,
  name,
  sort,
  created_at
FROM gz_books.categories
ORDER BY sort;

-- 查看创建的图书
SELECT
  b.id,
  b.isbn,
  b.title,
  b.author,
  c.name as category,
  bc.total_copies,
  bc.available_copies,
  bc.location
FROM gz_books.books b
JOIN gz_books.categories c ON b.category_id = c.id
LEFT JOIN gz_books.book_copies bc ON b.id = bc.book_id
ORDER BY b.created_at;

-- ========== 清理辅助函数 (可选) ==========
-- 如果不再需要，可以删除辅助函数
-- DROP FUNCTION IF EXISTS gz_books.generate_simple_uuid();
