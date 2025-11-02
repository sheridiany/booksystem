#!/bin/bash

# 高斯图书借阅系统 - 数据库初始化脚本

echo "🔧 正在初始化openGauss数据库..."

# 数据库连接信息
DB_HOST="127.0.0.1"
DB_PORT="15433"
DB_USER="gaussdb"
DB_PASSWORD="Nibuzhid@0"
DB_NAME="postgres"

# 执行SQL脚本
export PGPASSWORD="${DB_PASSWORD}"

# 注意: 如果没有安装psql客户端,请手动执行 prisma/init.sql

if command -v psql &> /dev/null; then
    echo "✅ 找到psql客户端,开始执行..."
    psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f prisma/init.sql
    echo "✅ 数据库初始化完成!"
else
    echo "⚠️  未找到psql客户端"
    echo ""
    echo "请手动执行以下SQL脚本:"
    echo "文件位置: $(pwd)/prisma/init.sql"
    echo ""
    echo "或使用其他数据库客户端工具连接到:"
    echo "  Host: ${DB_HOST}"
    echo "  Port: ${DB_PORT}"
    echo "  User: ${DB_USER}"
    echo "  Database: ${DB_NAME}"
fi
