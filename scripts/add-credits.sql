-- AI 肖像画廊 - 手动添加积分脚本
-- 使用方法: 在 Supabase SQL Editor 中执行

-- Step 1: 查看当前用户 UUID 和积分
SELECT
  u.uuid,
  u.email,
  COALESCE(SUM(c.credits), 0) as total_credits
FROM users u
LEFT JOIN credits c ON u.uuid = c.user_uuid
GROUP BY u.uuid, u.email
ORDER BY u.created_at DESC
LIMIT 5;

-- Step 2: 给指定用户添加 1000 积分 (有效期 1 年)
-- ⚠️ 替换 'YOUR_USER_UUID_HERE' 为你的实际 UUID

INSERT INTO credits (
  trans_no,
  user_uuid,
  trans_type,
  credits,
  created_at,
  expired_at,
  order_no
) VALUES (
  'test-' || gen_random_uuid()::text,  -- 生成唯一交易号
  'YOUR_USER_UUID_HERE',               -- ⚠️ 替换为你的 UUID
  'system_add',                        -- 系统添加类型
  1000,                                -- 添加 1000 积分
  NOW(),                               -- 当前时间
  NOW() + INTERVAL '1 year',           -- 1年后过期
  ''                                   -- 无订单号
);

-- Step 3: 验证积分是否添加成功
SELECT
  trans_no,
  trans_type,
  credits,
  created_at,
  expired_at
FROM credits
WHERE user_uuid = 'YOUR_USER_UUID_HERE'
ORDER BY created_at DESC
LIMIT 5;

-- 快捷脚本: 给所有用户批量加 1000 积分 (测试环境)
-- ⚠️ 慎用! 只在开发环境使用
/*
INSERT INTO credits (trans_no, user_uuid, trans_type, credits, created_at, expired_at, order_no)
SELECT
  'test-' || gen_random_uuid()::text,
  uuid,
  'system_add',
  1000,
  NOW(),
  NOW() + INTERVAL '1 year',
  ''
FROM users;
*/
