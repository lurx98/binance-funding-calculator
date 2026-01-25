# 币安资金费率计算器

基于 Next.js 14 + TypeScript + Prisma + PostgreSQL 的资金费率计算工具。

## 功能特性

- 从币安 API 获取资金费率历史数据
- 支持按持仓数量或投入金额计算收益
- 多维度统计展示（日/月/年）
- 数据缓存到 PostgreSQL 数据库
- 历史查询记录管理

## 技术栈

- **前端**: Next.js 14 (App Router) + React 18 + TypeScript
- **样式**: Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL 15+
- **ORM**: Prisma
- **日期处理**: date-fns

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

修改 `.env` 文件中的数据库连接信息：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/binance_funding?schema=public"
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库表
npx prisma db push

# 或者使用 migration
npx prisma migrate dev --name init
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
binance-funding-calculator/
├── app/
│   ├── api/
│   │   └── calculate/
│   │       └── route.ts          # 计算 API 路由
│   ├── page.tsx                  # 主页面
│   └── layout.tsx                # 根布局
├── lib/
│   ├── prisma.ts                 # Prisma 客户端
│   ├── types.ts                  # TypeScript 类型定义
│   ├── binance-api.ts            # 币安 API 调用逻辑
│   └── calculator.ts             # 收益计算逻辑
├── prisma/
│   └── schema.prisma             # 数据库模型定义
└── .env                          # 环境变量配置
```

## API 接口

### POST /api/calculate

计算资金费率收益

**请求体：**

```json
{
  "symbol": "XAGUSDT",
  "inputType": "quantity",
  "inputValue": 1000,
  "startDate": "2026-01-15"
}
```

**参数说明：**

- `symbol`: 交易对符号（如 BTCUSDT, ETHUSDT, XAGUSDT）
- `inputType`: 输入类型（`quantity` 持仓数量 或 `amount` 投入金额）
- `inputValue`: 输入值（持仓数量或投入金额）
- `startDate`: 起始日期（YYYY-MM-DD 格式）

## 计算公式

### 按持仓数量计算

```
单次收益 = 持仓数量 × 标记价格 × 资金费率
```

### 按投入金额计算

```
持仓数量 = 投入金额 ÷ 首条数据的标记价格
单次收益 = 持仓数量 × 标记价格 × 资金费率
```

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# Prisma 相关命令
npx prisma studio          # 打开数据库管理界面
npx prisma generate        # 生成 Prisma Client
npx prisma db push         # 推送数据库变更
npx prisma migrate dev     # 创建迁移
```

## 注意事项

1. **数据库配置**: 确保 PostgreSQL 数据库已启动并正确配置连接信息
2. **API 限流**: 币安 API 有请求频率限制，代码中已实现 300ms 延迟
3. **数据缓存**: 首次查询会从币安 API 获取数据并缓存到数据库，后续查询直接从数据库读取
4. **日期格式**: 起始日期必须使用 YYYY-MM-DD 格式

## 许可证

MIT
