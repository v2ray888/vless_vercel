-- 添加server_group_id字段到subscriptions表
ALTER TABLE subscriptions ADD COLUMN server_group_id TEXT REFERENCES server_groups(id);

-- 为现有订阅记录填充server_group_id字段
UPDATE subscriptions 
SET server_group_id = (
    SELECT p.server_group_id 
    FROM plans p 
    WHERE p.id = subscriptions.plan_id
)
WHERE plan_id IS NOT NULL;

-- 为server_group_id字段创建索引
CREATE INDEX IF NOT EXISTS subscriptions_server_group_id_idx ON subscriptions(server_group_id);