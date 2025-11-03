import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { subscriptions, serverGroups, plans, users } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { validateV2RayUUID } from '@/lib/v2ray-api';

// 生成VLESS链接
function generateVlessLink(node: any, userUUID: string, serverGroup: any): string {
  const { ip, port, name } = node;
  
  // 获取服务器组的API URL作为sni和host
  let sni = ip;
  let host = ip;
  
  try {
    if (serverGroup.apiUrl) {
      const url = new URL(serverGroup.apiUrl);
      sni = url.hostname;
      host = url.hostname;
    }
  } catch (e) {
    // 如果解析URL失败，使用默认值
  }
  
  // 构造完整的VLESS链接
  const params = new URLSearchParams({
    encryption: 'none',
    security: 'tls',
    sni: sni,
    fp: 'random',
    allowInsecure: '1',
    type: 'ws',
    host: host,
    path: '/'
  });
  
  return `vless://${userUUID}@${ip}:${port}?${params.toString()}#${encodeURIComponent(name || `节点-${ip}`)}`;
}

// 生成Clash配置
function generateClashConfig(nodes: any[], userUUID: string, subscription: any, serverGroup: any): string {
  // 用于跟踪已使用的名称
  const usedNames = new Set<string>();
  
  // 生成唯一名称的函数
  const generateUniqueName = (baseName: string, index: number): string => {
    let name = baseName || `节点-${index + 1}`;
    let uniqueName = name;
    let counter = 1;
    
    // 如果名称已存在，添加序号直到找到唯一名称
    while (usedNames.has(uniqueName)) {
      uniqueName = `${name}-${counter}`;
      counter++;
    }
    
    // 记录已使用的名称
    usedNames.add(uniqueName);
    return uniqueName;
  };
  
  const proxies = nodes.map((node: any, index: number) => {
    const { ip, port, name } = node;
    
    // 获取服务器组的API URL作为tls server name
    let serverName = ip;
    try {
      if (serverGroup.apiUrl) {
        const url = new URL(serverGroup.apiUrl);
        serverName = url.hostname;
      }
    } catch (e) {
      // 如果解析URL失败，使用默认值
    }
    
    // 生成唯一代理名称
    const proxyName = generateUniqueName(name, index);
    
    return {
      name: proxyName,
      type: "vless",
      server: ip,
      port: parseInt(port),
      uuid: userUUID,
      alterId: 0,
      cipher: "auto",
      tls: true,
      "servername": serverName,
      "skip-cert-verify": true,
      network: "ws",
      "ws-opts": {
        path: "/",
        headers: {
          Host: serverName
        }
      }
    };
  });

  const config = {
    port: 7890,
    "socks-port": 7891,
    "allow-lan": false,
    mode: "Rule",
    "log-level": "info",
    "external-controller": "127.0.0.1:9090",
    proxies: proxies,
    "proxy-groups": [
      {
        name: "Proxy",
        type: "select",
        proxies: proxies.map((proxy: any) => proxy.name)
      }
    ],
    rules: [
      "DOMAIN-SUFFIX,google.com,Proxy",
      "DOMAIN-KEYWORD,google,Proxy",
      "DOMAIN,google.com,Proxy",
      "DOMAIN-SUFFIX,ad.com,REJECT",
      "GEOIP,CN,DIRECT",
      "MATCH,Proxy"
    ]
  };

  return `# Clash 配置文件
# 生成时间: ${new Date().toISOString()}
# 订阅用户: ${userUUID}
# 过期时间: ${subscription.expiresAt.toISOString()}

${JSON.stringify(config, null, 2)}`;
}

// 生成Surfboard配置
function generateSurfboardConfig(nodes: any[], userUUID: string, serverGroup: any): string {
  let config = '';
  
  // 用于跟踪已使用的名称
  const usedNames = new Set<string>();
  
  // 生成唯一名称的函数
  const generateUniqueName = (baseName: string, index: number): string => {
    let name = baseName || `节点-${index + 1}`;
    let uniqueName = name;
    let counter = 1;
    
    // 如果名称已存在，添加序号直到找到唯一名称
    while (usedNames.has(uniqueName)) {
      uniqueName = `${name}-${counter}`;
      counter++;
    }
    
    // 记录已使用的名称
    usedNames.add(uniqueName);
    return uniqueName;
  };
  
  // 获取服务器组的API URL作为tls server name
  let serverName = '';
  try {
    if (serverGroup.apiUrl) {
      const url = new URL(serverGroup.apiUrl);
      serverName = url.hostname;
    }
  } catch (e) {
    // 如果解析URL失败，使用默认值
  }
  
  // 存储代理名称以便在代理组中使用
  const proxyNames: string[] = [];
  
  // 添加代理部分
  nodes.forEach((node: any, index: number) => {
    const { ip, port, name } = node;
    const proxyName = generateUniqueName(name, index);
    
    // 保存代理名称
    proxyNames.push(proxyName);
    
    // 使用VLESS配置而不是VMess
    if (serverName) {
      config += `${proxyName}=vless,${ip},${port},${userUUID},tls=true,servername=${serverName},skip-cert-verify=true,ws=true,ws-path=/,ws-headers=Host:${serverName}\n`;
    } else {
      config += `${proxyName}=vless,${ip},${port},${userUUID},tls=true,skip-cert-verify=true,ws=true,ws-path=/,ws-headers=Host:${ip}\n`;
    }
  });
  
  // 添加代理组
  config += `\n[Proxy Group]\n`;
  config += `Proxy = select,${proxyNames.join(',')}\n`;
  
  // 添加规则
  config += `\n[Rule]\n`;
  config += `DOMAIN-SUFFIX,google.com,Proxy\n`;
  config += `DOMAIN-KEYWORD,google,Proxy\n`;
  config += `DOMAIN,google.com,Proxy\n`;
  config += `DOMAIN-SUFFIX,ad.com,REJECT\n`;
  config += `GEOIP,CN,DIRECT\n`;
  config += `FINAL,Proxy,dns-failed\n`;
  
  return config;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const format = searchParams.get('format') || 'base64'; // 默认返回base64格式，支持clash格式

  if (!token) {
    return NextResponse.json({ error: '缺少订阅令牌' }, { status: 400 });
  }

  try {
    const db = getDb();
    
    // 通过用户的subscriptionUrlToken查找订阅
    const [user] = await db.select().from(users).where(
      eq(users.subscriptionUrlToken, token)
    ).limit(1);
    
    if (!user) {
      return NextResponse.json({ error: '无效的订阅令牌' }, { status: 404 });
    }
    
    // 查找用户的订阅
    const [subscription] = await db.select().from(subscriptions).where(
      and(
        eq(subscriptions.userId, user.id),
        eq(subscriptions.status, 'active'),
        gte(subscriptions.expiresAt, new Date())
      )
    ).limit(1);
    
    if (!subscription) {
      return NextResponse.json({ error: '用户没有有效的订阅或订阅已过期' }, { status: 404 });
    }
    
    // 验证UUID在V2Ray面板中是否有效
    // 获取订阅关联的套餐
    const [plan] = await db.select().from(plans).where(
      eq(plans.id, subscription.planId)
    ).limit(1);
    
    if (!plan) {
      return NextResponse.json({ error: '未找到关联套餐' }, { status: 404 });
    }
    
    // 获取套餐关联的服务器组
    const [serverGroup] = await db.select().from(serverGroups).where(
      eq(serverGroups.id, plan.serverGroupId)
    ).limit(1);
    
    if (!serverGroup) {
      return NextResponse.json({ error: '未找到关联服务器组' }, { status: 404 });
    }
    
    // 如果服务器组配置了API信息，则验证UUID
    if (serverGroup.apiUrl && serverGroup.apiKey) {
      const validationResult = await validateV2RayUUID(
        {
          apiUrl: serverGroup.apiUrl,
          apiKey: serverGroup.apiKey
        },
        subscription.userUUID
      );
      
      // 添加详细的错误信息
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'UUID验证失败', 
          details: validationResult.message || '无法连接到V2Ray面板API',
          serverGroup: {
            id: serverGroup.id,
            name: serverGroup.name,
            apiUrl: serverGroup.apiUrl,
          }
        }, { status: 403 });
      }
      
      if (!validationResult.valid) {
        // UUID无效时，提供添加UUID的链接
        return NextResponse.json({ 
          error: 'UUID在V2Ray面板中无效', 
          details: '订阅的UUID未在V2Ray面板中找到或已被禁用',
          uuid: subscription.userUUID,
          serverGroup: {
            id: serverGroup.id,
            name: serverGroup.name,
            apiUrl: serverGroup.apiUrl,
          },
          addUuidUrl: `/dashboard/subscription/add-uuid?token=${token}`
        }, { status: 403 });
      }
    }
    
    // 解析节点数据
    let nodes: any[] = [];
    if (typeof serverGroup.nodes === 'string') {
      try {
        nodes = JSON.parse(serverGroup.nodes);
      } catch (e) {
        nodes = [];
      }
    } else if (Array.isArray(serverGroup.nodes)) {
      nodes = serverGroup.nodes;
    }
    
    if (nodes.length === 0) {
      return NextResponse.json({ error: '未找到可用节点' }, { status: 404 });
    }
    
    // 根据请求格式返回不同配置
    if (format === 'clash') {
      // 返回Clash YAML配置
      const clashConfig = generateClashConfig(nodes, subscription.userUUID, subscription, serverGroup);
      
      return new NextResponse(clashConfig, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': 'attachment; filename="clash-config.yaml"',
          'Subscription-Userinfo': `upload=0; download=${subscription.trafficUsed}; total=${subscription.trafficTotal}; expire=${Math.floor(subscription.expiresAt.getTime() / 1000)}`,
        },
      });
    } else if (format === 'surfboard') {
      // 返回Surfboard配置
      const surfboardConfig = generateSurfboardConfig(nodes, subscription.userUUID, serverGroup);
      
      return new NextResponse(surfboardConfig, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'attachment; filename="surfboard-config.conf"',
          'Subscription-Userinfo': `upload=0; download=${subscription.trafficUsed}; total=${subscription.trafficTotal}; expire=${Math.floor(subscription.expiresAt.getTime() / 1000)}`,
        },
      });
    } else {
      // 默认返回Base64编码的VLESS链接列表
      const nodeList = nodes.map((node: any) => 
        generateVlessLink(node, subscription.userUUID, serverGroup)
      );
      
      // 将节点列表转换为Base64编码
      const base64Config = Buffer.from(nodeList.join('\n')).toString('base64');
      
      // 返回Base64编码的配置
      return new NextResponse(base64Config, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Subscription-Userinfo': `upload=0; download=${subscription.trafficUsed}; total=${subscription.trafficTotal}; expire=${Math.floor(subscription.expiresAt.getTime() / 1000)}`,
        },
      });
    }
  } catch (error) {
    console.error('订阅API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}