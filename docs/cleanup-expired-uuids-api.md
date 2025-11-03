# 清理过期UUID API 使用说明

## 接口地址
```
POST /api/cleanup-expired-uuids
```

## 功能说明
此API用于清理所有服务器组中已过期订阅的UUID，从V2Ray面板中删除这些不再需要的UUID，以节省资源。

## 认证方式
为了安全起见，可以设置认证令牌来保护此API：

1. 在 `.env.local` 文件中设置 `CRON_AUTH_TOKEN` 环境变量：
   ```
   CRON_AUTH_TOKEN=your_secure_token_here
   ```

2. 在请求头中包含认证信息：
   ```
   Authorization: Bearer your_secure_token_here
   ```

如果未设置 `CRON_AUTH_TOKEN` 环境变量，则API无需认证即可访问。

## 使用方法

### 使用 curl 命令
```bash
# 不需要认证的情况
curl -X POST https://your-domain.com/api/cleanup-expired-uuids

# 需要认证的情况
curl -X POST https://your-domain.com/api/cleanup-expired-uuids \
  -H "Authorization: Bearer your_secure_token_here"
```

### 使用定时任务 (Cron Job)
您可以在服务器上设置定时任务来定期调用此API：

```bash
# 每天凌晨2点执行
0 2 * * * curl -X POST https://your-domain.com/api/cleanup-expired-uuids -H "Authorization: Bearer your_secure_token_here"
```

### 使用 Node.js 脚本
```javascript
const cleanupExpiredUUIDs = async () => {
  try {
    const response = await fetch('https://your-domain.com/api/cleanup-expired-uuids', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your_secure_token_here'
      }
    });
    
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('清理过期UUID失败:', error);
  }
};

cleanupExpiredUUIDs();
```

## 响应格式

### 成功响应
```json
{
  "success": true,
  "message": "清理完成，总共删除 5 个UUID，失败 0 个",
  "totalRemovedCount": 5,
  "totalFailedCount": 0,
  "results": [
    {
      "serverGroupId": "sg_1",
      "serverGroupName": "基础组",
      "success": true,
      "message": "成功处理 3 个过期订阅",
      "removedCount": 3,
      "failedCount": 0
    },
    {
      "serverGroupId": "sg_2",
      "serverGroupName": "高级组",
      "success": true,
      "message": "成功处理 2 个过期订阅",
      "removedCount": 2,
      "failedCount": 0
    }
  ]
}
```

### 错误响应
```json
{
  "success": false,
  "error": "未授权的访问"
}
```

## 注意事项
1. 此API会删除V2Ray面板中实际的UUID，请谨慎使用。
2. 建议在低峰时段执行此操作，以避免影响用户正常使用。
3. 可以通过查看响应结果来监控清理操作的成功率。
4. 如果某些UUID删除失败，可以在响应中查看具体的失败UUID列表。