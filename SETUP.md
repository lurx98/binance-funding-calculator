# 项目设置说明

## 重要提示

在运行项目之前，请先配置数据库连接！

### 1. 配置数据库连接

编辑 `.env` 文件，修改数据库连接信息：

```env
DATABASE_URL="postgresql://你的用户名:你的密码@localhost:5432/binance_funding?schema=public"
```

**示例：**
```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/binance_funding?schema=public"
```

### 2. 创建数据库

在 PostgreSQL 中创建数据库：

```sql
CREATE DATABASE binance_funding;
```

### 3. 初始化数据库表

运行以下命令创建数据库表：

```bash
npx prisma db push
```

或者使用 migration：

```bash
npx prisma migrate dev --name init
```

### 4. 启动项目

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 测试功能

点击页面上的"开始计算"按钮，系统会：
1. 从币安 API 获取 XAGUSDT 的资金费率数据（从 2026-01-15 开始）
2. 按持仓数量 1000 计算收益
3. 显示日/月/年统计结果

## 常见问题

### Q: 数据库连接失败？
A: 请检查：
- PostgreSQL 服务是否启动
- 数据库连接信息是否正确
- 数据库是否已创建

### Q: Prisma 生成失败？
A: 运行 `npx prisma generate` 重新生成客户端

### Q: 币安 API 请求失败？
A: 可能是网络问题或 API 限流，代码会自动重试

## 下一步

配置完成后，你可以：
1. 修改测试参数（在 `app/page.tsx` 中）
2. 开发完整的表单界面
3. 添加图表展示
4. 实现历史记录功能
