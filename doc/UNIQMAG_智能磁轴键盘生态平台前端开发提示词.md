# UNIQMAG 智能磁轴键盘生态平台前端开发提示词

## 项目定位

打造连接「磁轴键盘硬件 + 用户账号 + SN设备绑定 + 软件驱动 + 商城 +
社区 + AI助手」的一体化生态平台。

参考： - Apple ID生态 - Tesla账户系统 - Razer Synapse - Logitech G HUB -
小米IoT生态

------------------------------------------------------------------------

# 技术架构

## 前端技术栈

-   React 19
-   TypeScript
-   Vite 8
-   Tailwind CSS 4（@tailwindcss/vite）
-   React Router DOM 7
-   Framer Motion
-   Lucide React（图标）

## 后端 / API

-   Cloudflare Pages Functions（生产环境 · 联系表单）
-   Vite 开发中间件（本地 `/api/contact` 代理）
-   Resend（联系表单邮件发送）
-   共享 API 逻辑：`api/contact-handler.ts`
-   C 端用户 API：`/app/v1/*`（对接 uniqmag-admin backend，见其 `docs/app-api.md`）
    -   开发：Vite proxy `/app` → `http://127.0.0.1:8080`
    -   生产：可设 `VITE_API_BASE_URL` 指向 API 根地址
    -   前端封装：`src/api/client.ts`、`src/api/auth.ts`

## 目录结构

```
webiste-future/
├── api/                    # 共享 API 处理逻辑
│   └── contact-handler.ts
├── functions/              # Cloudflare Pages Functions
│   └── api/contact.ts
├── public/assets/          # 静态资源（图片、视频）
├── src/
│   ├── components/         # 页面区块与 UI 组件
│   ├── data/               # 静态 JSON 内容数据
│   ├── App.tsx             # 路由配置
│   ├── main.tsx            # 应用入口
│   └── index.css           # Tailwind + 设计变量
├── vite.config.ts
└── package.json
```

## 页面路由

路由定义在 `src/App.tsx`，导航文案与 `Navbar` / `Footer` 保持一致。

### 全局布局

所有页面共用：`Background`（背景）+ `Navbar`（顶栏）+ `Footer`（页脚）

### 导航菜单

| 导航名称 | 路径 |
|----------|------|
| 首页 | `/` |
| 产品 | `/products` |
| 软件 | `/software` |
| 支持 | `/support` |
| 关于我们 | `/about` |
| 联系我们 | `/contact` |
| 登录 / 注册 / 个人中心 | `/login` · `/register` · `/account` |

### 路由表

| 路径 | 页面 | 组件 | 说明 |
|------|------|------|------|
| `/` | 首页 | Hero、UniqlevSwitch、TmrSensor | 品牌 Hero + 磁悬浮轴介绍 + TMR 传感器 |
| `/products` | 产品列表 | Products | 展示全部产品卡片 |
| `/products/:id` | 产品详情 | ProductDetail | 动态路由，`:id` 对应产品 id |
| `/software` | 软件 | Software | 驱动 / 软件下载 |
| `/support` | 支持 | Support | FAQ、售后政策等 |
| `/about` | 关于我们 | About | 公司介绍与发展历程 |
| `/contact` | 联系我们 | Contact | 联系表单（提交至 `/api/contact`） |
| `/login` | 登录 | Login | 验证码登录 + 密码登录（`/auth/sms/*`、`/auth/login`） |
| `/register` | 注册 | Register | 密码注册（`POST /app/v1/auth/register`，需后端实现） |
| `/onboarding/nickname` | 完善昵称 | CompleteNickname | 短信新用户完善昵称；`PUT /me/nickname` |
| `/account` | 个人中心 | Account | 需登录；`GET /app/v1/me` |

### 产品详情实例

| 路径 | 产品 |
|------|------|
| `/products/uq68` | UQ68 |
| `/products/uq71` | UQ71 |

数据来源：`src/data/products.json` 中的 `id` 字段。


## 开发与部署

```bash
npm run dev      # 本地开发（Vite + contact API 中间件）
npm run build    # TypeScript 编译 + Vite 构建
npm run preview  # 预览构建产物
```

部署目标：Cloudflare Pages（`functions/` 目录自动识别为 Edge Functions）

------------------------------------------------------------------------

# 用户账号系统

## 注册

支持： - 手机号注册

流程：

注册账号 → 验证 → 创建密码 → 创建UNIQMAG ID → 绑定设备

用户字段：

-   user_id
-   username
-   avatar
-   email
-   phone
-   level
-   points
-   register_time

------------------------------------------------------------------------

# UNIQMAG ID体系

类似 Apple ID：

功能： - 账号管理 - 登录设备管理 - 安全设置 - 用户信息维护

------------------------------------------------------------------------

# SN设备绑定系统

核心功能：

一人一机一SN

流程：

输入SN码 → 验证SN → 绑定账号 → 激活设备

设备字段：

-   device_sn
-   model
-   firmware_version
-   activation_time
-   owner_id

------------------------------------------------------------------------

# 键盘设备中心

功能：

-   设备信息展示
-   固件版本检测
-   参数配置
-   游戏模式管理

支持参数：

-   RT
-   Rapid Trigger
-   SOCD
-   MT
-   TGL
-   MPT
-   END

模式：

-   FPS模式
-   游戏模式
-   办公模式
-   自定义模式

------------------------------------------------------------------------

# 固件升级系统

支持：

-   OTA升级
-   版本检测
-   下载升级
-   升级日志
-   升级进度显示

------------------------------------------------------------------------

# AI智能键盘助手

功能：

用户输入：

> 帮我设置CS2最佳RT

AI：

分析设备 → 推荐参数 → 生成配置 → 写入键盘

支持：

-   AI聊天
-   语音输入
-   WebSocket通信
-   设备控制

------------------------------------------------------------------------

# 商城系统

商品：

-   磁轴键盘
-   键帽
-   配件
-   鼠标
-   鼠标垫
-   会员服务

购物流程：

浏览商品 → 加入购物车 → 下单 → 支付 → SN绑定 → 激活

支持：

-   微信支付
-   支付宝
-   Stripe

------------------------------------------------------------------------

# 积分生态

积分来源：

-   产品购买
-   签到
-   邀请
-   活动

积分用途：

-   兑换配件
-   兑换会员
-   游戏礼包

------------------------------------------------------------------------

# 会员系统

等级：

-   普通用户
-   银牌会员
-   黄金会员
-   电竞大师
-   UNIQMAG Pro

权益：

-   专属固件
-   提前购买
-   免费升级
-   优先客服

------------------------------------------------------------------------

# 售后系统

功能：

-   工单提交
-   维修查询
-   客服支持

工单包含：

-   问题描述
-   图片
-   SN码
-   状态

------------------------------------------------------------------------

# 社区系统

功能：

-   配置分享
-   MOD作品
-   RGB方案
-   点赞
-   收藏
-   评论

------------------------------------------------------------------------

# API模块

## Auth

-   /user/login
-   /user/register

## Device

-   /device/bind
-   /device/info
-   /device/update

## Keyboard

-   /profile/save
-   /profile/load

## Store

-   /product/list
-   /order/create

## Points

-   /points/history

## AI

-   /chat

------------------------------------------------------------------------

# 视觉设计

风格：

高端电竞科技感

参考：

-   Tesla
-   Apple Vision Pro
-   Nothing Phone
-   Razer

设计：

-   黑色科技背景
-   毛玻璃效果
-   3D键盘展示
-   动态粒子
-   流畅动画

------------------------------------------------------------------------

# 开发阶段

## Phase 1

用户系统： - 注册登录 - UNIQMAG ID

## Phase 2

设备系统： - SN绑定 - 设备中心

## Phase 3

键盘配置： - 参数管理 - 固件升级

## Phase 4

商城： - 商品 - 订单 - 支付

## Phase 5

生态： - 积分 - 会员 - 社区

## Phase 6

AI： - 智能助手 - 自动配置

------------------------------------------------------------------------

目标：

打造一个商业级 UNIQMAG 智能磁轴键盘生态平台。
