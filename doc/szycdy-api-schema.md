# UNIQMAG / szycdy.com — API 与表结构草图

> 依据 `szycdy-商城页面清单.xlsx`（用户站 / 管理后台 / 业务冻结项）整理。  
> 前端管理端建议：Ant Design Pro；本文件描述**自建后端**契约，与 Pro 无绑定关系。

## 约定

| 项 | 建议 |
|----|------|
| Base URL | `https://api.szycdy.com` |
| 管理端前缀 | `/admin/v1/*` + Admin JWT |
| 用户端前缀 | `/app/v1/*` + User JWT（短信登录） |
| 金额 | 一律 **分**（cent） |
| 列表参数 | `page`, `page_size` |
| 列表响应 | `{ "list": [], "total": 0 }` |
| 角色 | `ops`（运营）/ `warehouse`（仓储）/ `super`（超管） |
| UID 脱敏 | 仅 `super`（或仓储）明文；运营侧掩码；**用户端永不返回 UID** |
| 站点 | 用户站挂载 `szycdy.com`；后台 `admin.szycdy.com` 或 `/admin` |

---

## 1. 表结构（核心）

### 1.1 账号与权限

```text
admin_user              # 管理员
  id
  username
  password_hash
  role                  # ops | warehouse | super
  status
  created_at

app_user               # C 端用户（短信登录即注册，无独立注册）
  id
  mobile                # 唯一
  nickname              # 可空；新用户登录后必填
  profile_completed     # 是否已完善昵称；false 时前端强制跳完善页
  status                # 含 disabled
  created_at
  last_login_at

address                 # 收货地址
  id
  user_id
  name
  mobile
  province
  city
  district
  detail
  is_default
```

### 1.2 商品与运费

```text
product
  id
  sku                   # 或型号，入库 Excel 对齐用
  name
  cover
  images_json
  price_cent
  stock_summary         # 冗余：status=in_stock 的 device 数
  status                # on | off
  created_at
  updated_at

shipping_rule           # 可后开（冻结项：后台可配置）
  id
  mode                  # free | fixed | threshold_free
  fixed_cent
  threshold_cent
  enabled
```

### 1.3 订单与支付

```text
order
  id
  order_no
  user_id
  status                # pending_pay | paid | shipped | completed | refunded | cancelled
  pay_channel           # wechat | alipay | null
  amount_cent
  freight_cent
  address_snapshot_json
  shipped_at
  express_company
  express_no
  refunded_at
  created_at

order_item
  id
  order_id
  product_id
  sku
  title
  price_cent
  qty
  need_sn               # 是否需分配 SN

payment
  id
  order_id
  channel
  trade_no
  amount_cent
  status
  paid_at
  raw_notify
```

订单主路径：`pending_pay → paid → shipped → completed`；未发货可 `paid → refunded`。

### 1.4 库存 / SN / UID

```text
device_unit             # 一台设备一行；SN、UID 全局唯一且成对
  id
  product_id
  sn
  uid
  status                # in_stock | sold | bound | lost
  inbound_at
  outbound_at
  bound_at
  order_id              # 出库关联订单，可空
  user_id               # 绑定用户，可空
  activated_points_granted  # 激活送积分是否已发（同一 SN 终身一次）
  created_at

inventory_log
  id
  type                  # inbound | outbound_ship | outbound_loss | adjust
  product_id
  device_unit_id        # 可空（汇总调整时）
  order_id              # 可空
  admin_id
  qty
  remark
  created_at
```

入库冻结规则：

- 每条必须同时有 **SN + UID**
- SN 唯一、UID 唯一、二者一一对应
- 缺任一字段不可入库
- 支持单条添加 / Excel 批量导入

### 1.5 积分

```text
points_rule
  id
  code                  # register | order | activate | ...
  name
  points
  enabled
  promo_copy_enabled    # 宣传文案开关（前端后开）
  config_json
  updated_at

points_ledger
  id
  user_id
  delta
  balance_after
  reason_code
  ref_type
  ref_id
  operator_admin_id     # 人工调账时
  remark
  created_at
```

---

## 2. 管理端 API（`/admin/v1`）

对应清单「管理后台」模块。

### 2.1 通用

| Method | Path | 说明 | 角色 |
|--------|------|------|------|
| POST | `/auth/login` | 账号密码 → token + role | 公开 |
| GET | `/auth/me` | 当前管理员与菜单权限 | 已登录 |

### 2.2 运营 · 概览 / 用户 / 商品

| Method | Path | 说明 | 角色 |
|--------|------|------|------|
| GET | `/dashboard` | 今日订单、待发货等（可极简） | ops, super |
| GET | `/users` | 用户列表 `?mobile=&status=`（含昵称） | ops, super |
| PATCH | `/users/:id` | 禁用/启用 `{ status }` | ops, super |
| GET | `/products` | 商品列表 | ops, super |
| POST | `/products` | 新建商品 | ops, super |
| GET | `/products/:id` | 详情（含库存汇总） | ops, super |
| PUT | `/products/:id` | 编辑上架信息、价格等 | ops, super |
| PATCH | `/products/:id/status` | 上下架 | ops, super |

### 2.3 运费（冻结后开，预留）

| Method | Path | 说明 | 角色 |
|--------|------|------|------|
| GET | `/shipping/rules` | 当前规则 | ops, super |
| PUT | `/shipping/rules` | 包邮 / 固定运费 / 满额包邮 | ops, super |

### 2.4 订单 / 发货 / 退款

| Method | Path | 说明 | 角色 |
|--------|------|------|------|
| GET | `/orders` | `?status=&order_no=&mobile=` | ops, super |
| GET | `/orders/:id` | 详情 + 明细 + 已分配 SN | ops, super |
| POST | `/orders/:id/ship` | **发货一步完成**（写出库+扣库存+填快递+分配 SN） | ops, super |
| POST | `/orders/:id/refund` | 仅未发货全额退 | ops, super |

`POST /orders/:id/ship` 请求体示例：

```json
{
  "express_company": "SF",
  "express_no": "SF1234567890",
  "allocations": [
    { "order_item_id": 1, "device_unit_ids": [101, 102] }
  ]
}
```

服务端校验与事务：

1. 订单状态为 `paid`（未发货）
2. 待分配设备均为 `in_stock`，且 `product_id` 与明细匹配
3. 同一事务内：写快递信息 → 订单 `shipped` → 设备 `sold` → `inventory_log(outbound_ship)` → 刷新 `stock_summary`
4. 带 SN 商品发货时分配 SN，UID 随 SN 带出（仅后台可见）

### 2.5 积分

| Method | Path | 说明 | 角色 |
|--------|------|------|------|
| GET | `/points/rules` | 规则列表（注册送/下单送/激活送等） | ops, super |
| PUT | `/points/rules/:id` | 改积分值、开关、宣传文案开关 | ops, super |
| GET | `/points/ledger` | 流水 `?user_id=&mobile=` | ops, super |
| POST | `/points/ledger/adjust` | 人工补发/扣减（必留痕） | ops, super |

### 2.6 仓储 · 库存 / 入库 / 流水

| Method | Path | 说明 | 角色 |
|--------|------|------|------|
| GET | `/inventory` | 按商品汇总；`?product_id=` 下钻 SN+UID 明细 | warehouse, super |
| POST | `/inventory/inbound` | 单条或 JSON 批量入库 | warehouse, super |
| POST | `/inventory/inbound/import` | Excel 导入（见下方模板） | warehouse, super |
| GET | `/inventory/logs` | 出入库流水 | warehouse, super |
| POST | `/inventory/loss` | 手工损耗出库 | warehouse, super |

Excel 列（与清单「SN入库导入模板」一致）：

| 商品SKU或型号 | SN | UID | 备注 |
|---------------|----|-----|------|
| UQ68 | UQ68-26A-TW-000001-X7 | E6614103E7898A28 | 示例行导入前删除 |

### 2.7 设备

| Method | Path | 说明 | 角色 |
|--------|------|------|------|
| GET | `/devices` | `?sn=&uid=&status=&product_id=`；UID 按角色脱敏 | ops(掩码), warehouse, super |
| GET | `/devices/:id` | SN、UID、绑定用户、激活时间、积分发放、解绑留痕 | 同上 |
| POST | `/devices/:id/unbind` | 解绑并留痕（首期可选） | super |

### 2.8 角色（首期可简化写死）

| Method | Path | 说明 | 角色 |
|--------|------|------|------|
| GET | `/roles` | 角色与菜单定义 | super |
| PUT | `/admin-users/:id/role` | 修改管理员角色 | super |

#### 菜单可见性

| 模块 | ops | warehouse | super |
|------|:---:|:---------:|:-----:|
| 概览 / 用户 / 商品 / 订单 / 积分 | ✓ | | ✓ |
| 库存 / 入库 / 流水 | | ✓ | ✓ |
| 设备列表 / 详情 | ✓ UID 掩码 | ✓ | ✓ |
| 角色权限 | | | ✓ |

---

## 3. 用户端 API（`/app/v1`）

对应清单「用户站」。登录方式冻结：**仅手机号 + 短信验证码**；**无独立注册页**。支付冻结：**微信 + 支付宝**。

### 登录 / 注册流程

```text
输入手机号 → 短信验证码 → POST /auth/sms/login
  ├─ 手机号已存在 → 发 token，profile_completed=true → 直接进入
  └─ 手机号不存在 → 自动创建 app_user → 发 token，profile_completed=false
                      → 前端跳转 /account/profile/nickname
                      → PUT /me/nickname 成功后 profile_completed=true → 进入站点
```

| Method | Path | 说明 |
|--------|------|------|
| POST | `/auth/sms/send` | 发送验证码 |
| POST | `/auth/sms/login` | 验证码登录；未注册则自动建号。响应含 `is_new_user`、`profile_completed`、`token` |
| PUT | `/me/nickname` | 新用户完善昵称 `{ "nickname": "..." }`；成功后 `profile_completed=true` |
| GET | `/me` | 我的（入口汇总；含 `nickname`、`profile_completed`） |
| GET | `/shop/products` | 商城列表 |
| GET | `/shop/products/:id` | 详情（价格、运费说明、加购） |
| GET | `/cart` | 购物车 |
| PUT | `/cart` | 更新购物车 |
| POST | `/checkout` | 确认下单（地址、运费、渠道 `wechat` \| `alipay`） |
| GET | `/pay/orders/:id` | 拉起支付参数 |
| POST | `/pay/notify/wechat` | 微信支付回调 |
| POST | `/pay/notify/alipay` | 支付宝回调 |
| GET | `/pay/result` | 支付结果页数据 |
| GET | `/me/orders` | 订单列表（状态筛选） |
| GET | `/me/orders/:id` | 订单详情（含物流单号） |
| POST | `/me/orders/:id/refund` | 未发货全额退 |
| GET | `/me/addresses` | 地址列表 |
| POST | `/me/addresses` | 新增地址 |
| PUT | `/me/addresses/:id` | 编辑地址 |
| DELETE | `/me/addresses/:id` | 删除地址 |
| GET | `/me/points` | 积分明细（只看流水；无宣传文案） |
| GET | `/me/devices` | 已绑键盘（型号、SN 掩码、绑定/激活时间；**不展示 UID**） |
| POST | `/me/devices/bind` | 用户侧只填 SN；校验后台已录入的 SN–UID 对应关系 |
| GET | `/me/devices/bind/result` | 绑定成功/失败；积分以明细为准 |

### 绑定规则（冻结 / 说明页）

- 官网用户绑定 SN 并激活；系统校验已入库的 SN–UID 对应关系
- 建议仅 `sold`（已出库/已售出）的 SN 允许激活绑定（若变更请改冻结项）
- 激活送积分后台可配置；同一 SN 终身一次（`activated_points_granted`）

---

## 4. 关键事务（建议单测覆盖）

### 4.1 入库

1. 校验 SN、UID 均非空且全局唯一  
2. 写入 `device_unit(status=in_stock)`  
3. 写 `inventory_log(inbound)`  
4. 更新 `product.stock_summary`

### 4.2 发货（= 出库 + 扣库存 + 填快递）

1. 锁定订单（`paid`）  
2. 校验并分配在库 SN  
3. 写快递 → 订单 `shipped` → 设备 `sold` → 出库流水 → 刷新库存汇总  

### 4.3 退款

1. 仅未发货（`paid`）  
2. 退款成功 → `refunded`  
3. 库存不动（尚未出库）

### 4.4 用户激活绑 SN

1. SN 存在且状态允许绑定  
2. 设备 → `bound`，记录 `user_id` / `bound_at`  
3. 按 `points_rule(activate)` 入账；`activated_points_granted=true` 防重复  

---

## 5. 首期可砍（预留表/路由即可）

| 项 | 说明 |
|----|------|
| 运费配置页 | 冻结后开；表与 API 先占位 |
| 角色权限页 | 三角色写死配置，不做可视化编辑 |
| 设备解绑 | 详情可展示，操作后开 |
| 积分宣传文案 | 仅保留 `promo_copy_enabled`；用户端不展示宣传 |

---

## 6. 建议落地顺序

1. Admin 登录 + 角色  
2. 商品 CRUD  
3. 库存入库（含 Excel）与设备列表  
4. 订单列表 + **发货事务**  
5. 积分规则与流水  
6. 用户端：短信登录 → 商城下单 → 支付回调 → 绑 SN  

---

## 7. 与页面清单路径对照

### 管理后台

| 页面 | 前端路径建议 | 主要 API |
|------|--------------|----------|
| 后台登录 | `/admin/login` | `POST /admin/v1/auth/login` |
| 概览 | `/admin/dashboard` | `GET /admin/v1/dashboard` |
| 用户列表 | `/admin/users` | `GET/PATCH /admin/v1/users` |
| 商品列表 | `/admin/products` | `GET/POST /admin/v1/products` |
| 商品编辑 | `/admin/products/:id` | `GET/PUT /admin/v1/products/:id` |
| 运费设置 | `/admin/shipping` | `GET/PUT /admin/v1/shipping/rules` |
| 订单列表 | `/admin/orders` | `GET /admin/v1/orders` |
| 订单详情/发货 | `/admin/orders/:id` | `GET …/orders/:id`, `POST …/ship` |
| 积分规则 | `/admin/points/rules` | `GET/PUT /admin/v1/points/rules` |
| 积分流水 | `/admin/points/ledger` | `GET/POST /admin/v1/points/ledger*` |
| 库存列表 | `/admin/inventory` | `GET /admin/v1/inventory` |
| 入库 | `/admin/inventory/inbound` | `POST …/inbound`, `…/import` |
| 出入库流水 | `/admin/inventory/logs` | `GET /admin/v1/inventory/logs` |
| 设备/SN 列表 | `/admin/devices` | `GET /admin/v1/devices` |
| 设备详情 | `/admin/devices/:id` | `GET /admin/v1/devices/:id` |
| 角色权限 | `/admin/roles` | `GET /admin/v1/roles` |

### 用户站

| 页面 | 前端路径建议 | 主要 API |
|------|--------------|----------|
| 登录 | `/account/login` | `POST /app/v1/auth/sms/*`（未注册自动建号） |
| 完善昵称 | `/account/profile/nickname` | `PUT /app/v1/me/nickname` |
| 商城列表 | `/shop` | `GET /app/v1/shop/products` |
| 商品详情 | `/shop/:id` | `GET /app/v1/shop/products/:id` |
| 购物车 | `/cart` | `GET/PUT /app/v1/cart` |
| 确认订单 | `/checkout` | `POST /app/v1/checkout` |
| 支付结果 | `/pay/result` | `GET /app/v1/pay/result` |
| 我的 | `/account` | `GET /app/v1/me` |
| 订单列表 | `/account/orders` | `GET /app/v1/me/orders` |
| 订单详情 | `/account/orders/:id` | `GET /app/v1/me/orders/:id` |
| 收货地址 | `/account/addresses` | `/app/v1/me/addresses` |
| 积分明细 | `/account/points` | `GET /app/v1/me/points` |
| 我的设备 | `/account/devices` | `GET /app/v1/me/devices` |
| 绑定键盘 | `/account/devices/bind` | `POST /app/v1/me/devices/bind` |
| 绑定结果 | `/account/devices/bind/result` | `GET …/bind/result` |
