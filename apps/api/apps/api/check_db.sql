-- 检查 gz_books schema 是否存在
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'gz_books';

-- 检查现有表
SELECT table_name FROM information_schema.tables WHERE table_schema = 'gz_books';
