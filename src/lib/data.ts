import { NavItem, User, Plan, ServerGroup, Order, RedemptionCode, Tutorial, Announcement, Affiliate } from '@/lib/types';

export const adminNavItems: NavItem[] = [
  {
    title: '仪表板',
    href: '/admin/dashboard',
    icon: 'dashboard',
  },
  {
    title: '用户管理',
    href: '/admin/users',
    icon: 'users',
  },
  {
    title: '套餐管理',
    href: '/admin/packages',
    icon: 'package',
  },
  {
    title: '服务器组',
    href: '/admin/server-groups',
    icon: 'server',
  },
  {
    title: '订单管理',
    href: '/admin/orders',
    icon: 'orders',
  },
  {
    title: '兑换码管理',
    href: '/admin/redemption-codes',
    icon: 'ticket',
  },
  {
    title: '优惠码管理',
    href: '/admin/coupons',
    icon: 'percent',
  },
  {
    title: '推广管理',
    href: '/admin/affiliates',
    icon: 'affiliate',
  },
  {
    title: '财务管理',
    href: '/admin/finance',
    icon: 'wallet',
  },
  {
    title: '提现管理',
    href: '/admin/withdrawals',
    icon: 'landmark',
  },
  {
    title: '公告管理',
    href: '/admin/announcements',
    icon: 'megaphone',
  },
  {
    title: '教程管理',
    href: '/admin/tutorials',
    icon: 'help',
  },
  {
    title: '系统设置',
    href: '/admin/settings',
    icon: 'settings',
  },
];

export const userNavItems: NavItem[] = [
  {
    title: '仪表板',
    href: '/dashboard',
    icon: 'dashboard',
  },
  {
    title: '订阅地址',
    href: '/dashboard/subscription',
    icon: 'link',
  },
  {
    title: '节点信息',
    href: '/dashboard/nodes',
    icon: 'server',
  },
  {
    title: '推广中心',
    href: '/dashboard/referrals',
    icon: 'affiliate',
  },
  {
    title: '订单记录',
    href: '/dashboard/orders',
    icon: 'orders',
  },
  {
    title: '个人设置',
    href: '/dashboard/settings',
    icon: 'userCog',
  },
];

export const mockUsers: Omit<User, 'plan'> & { plan: string | null }[] = [
  { id: 'usr_1', name: '张三', email: 'zhangsan@example.com', status: 'active', plan: '季度套餐', endDate: '2024-09-30' },
  { id: 'usr_2', name: '李四', email: 'lisi@example.com', status: 'active', plan: '月度套餐', endDate: '2024-07-15' },
  { id: 'usr_3', name: '王五', email: 'wangwu@example.com', status: 'inactive', plan: '年度套餐', endDate: '2024-05-20' },
  { id: 'usr_4', name: '赵六', email: 'zhaoliu@example.com', status: 'suspended', plan: '月度套餐', endDate: '2024-06-25' },
  { id: 'usr_5', name: '孙七', email: 'sunqi@example.com', status: 'active', plan: '季度套餐', endDate: '2024-08-10' },
  { id: 'usr_6', name: '周八', email: 'zhouba@example.com', status: 'active', plan: '年度套餐', endDate: '2025-01-01' },
  { id: 'usr_7', name: '吴九', email: 'wujiu@example.com', status: 'inactive', plan: null, endDate: null },
];

export const mockPlans: Omit<Plan, 'price_monthly' | 'price_quarterly' | 'price_yearly'> & { price_monthly: number | null, price_quarterly: number | null, price_yearly: number | null }[] = [
    { id: 'plan_1', name: '月度套餐', price_monthly: 25, price_quarterly: null, price_yearly: null, server_group: '标准组', status: 'active' },
    { id: 'plan_2', name: '季度套餐', price_monthly: null, price_quarterly: 68, price_yearly: null, server_group: '标准组', status: 'active' },
    { id: 'plan_3', name: '年度套餐', price_monthly: null, price_quarterly: null, price_yearly: 240, server_group: '高级组', status: 'active' },
    { id: 'plan_4', name: '入门套餐', price_monthly: 10, price_quarterly: null, price_yearly: null, server_group: '入门组', status: 'inactive' },
];

export const mockServerGroups: ServerGroup[] = [
    { 
        id: 'sg_1', 
        name: '标准组', 
        api_url: '', 
        api_key: '', 
        server_count: 2,
        nodes: [
            { id: 1, name: '香港 01', location: '香港', status: 'online', speed: '25ms' },
            { id: 2, name: '日本 02', location: '东京', status: 'online', speed: '45ms' },
        ]
    },
    { 
        id: 'sg_2', 
        name: '高级组', 
        api_url: '', 
        api_key: '', 
        server_count: 2,
        nodes: [
            { id: 3, name: '美国 03', location: '洛杉矶', status: 'online', speed: '120ms' },
            { id: 4, name: '新加坡 01', location: '新加坡', status: 'maintenance', speed: '-' },
        ]
    },
    { id: 'sg_3', name: '入门组', api_url: '', api_key: '', server_count: 0, nodes: [] },
];

export const mockOrders: Order[] = [
    { id: 'ord_001', user_name: '张三', user_email: 'zhangsan@example.com', plan_name: '季度套餐', amount: 68, date: '2024-06-01', status: 'completed' },
    { id: 'ord_002', user_name: '李四', user_email: 'lisi@example.com', plan_name: '月度套餐', amount: 25, date: '2024-06-15', status: 'completed' },
    { id: 'ord_003', user_name: '孙七', user_email: 'sunqi@example.com', plan_name: '年度套餐', amount: 240, date: '2024-06-20', status: 'pending' },
    { id: 'ord_004', user_name: '王五', user_email: 'wangwu@example.com', plan_name: '年度套餐', amount: 240, date: '2023-05-20', status: 'completed' },
    { id: 'ord_005', user_name: '孙七', user_email: 'sunqi@example.com', plan_name: '季度套餐', amount: 68, date: '2024-05-10', status: 'completed' },
    { id: 'ord_006', user_name: '周八', user_email: 'zhouba@example.com', plan_name: '年度套餐', amount: 240, date: '2024-01-01', status: 'completed' },
    { id: 'ord_007', user_name: '李四', user_email: 'lisi@example.com', plan_name: '月度套餐', amount: 25, date: '2024-07-15', status: 'pending' },
];

export const mockRedemptionCodes: RedemptionCode[] = [
    { id: 'code_1', code: 'PROMO2024A', plan: '月度套餐', status: 'available', created_at: '2024-06-01', used_at: null, used_by: null },
    { id: 'code_2', code: 'PROMO2024B', plan: '月度套餐', status: 'available', created_at: '2024-06-01', used_at: null, used_by: null },
    { id: 'code_3', code: 'WELCOME-Q3', plan: '季度套餐', status: 'used', created_at: '2024-05-15', used_at: '2024-05-20', used_by: 'wangwu@example.com' },
    { id: 'code_4', code: 'SUMMERFUN1', plan: '季度套餐', status: 'available', created_at: '2024-06-20', used_at: null, used_by: null },
    { id: 'code_5', code: 'SUMMERFUN2', plan: '季度套餐', status: 'available', created_at: '2024-06-20', used_at: null, used_by: null },
    { id: 'code_6', code: 'YEARLYDEAL', plan: '年度套餐', status: 'used', created_at: '2024-01-01', used_at: '2024-01-01', used_by: 'zhouba@example.com' },
];

export const mockTutorials: Tutorial[] = [
    { 
        id: 'tut_1', 
        title: 'Clash for Windows 使用教程',
        content: '1. 下载并安装 Clash for Windows 客户端。\n2. 打开软件，进入 Profiles 页面。\n3. 将您的订阅地址粘贴到输入框中，点击 Download。\n4. 下载成功后，选择新添加的配置文件。\n5. 回到 General 页面，打开 System Proxy 开关即可开始使用。' 
    },
    { 
        id: 'tut_2', 
        title: 'Shadowrocket (iOS) 使用教程',
        content: '1. 在 App Store 下载并安装 Shadowrocket。\n2. 打开应用，点击右上角的 "+" 号。\n3. 选择 "Subscribe" 类型，将您的订阅地址粘贴到 URL 字段。\n4. 点击 "Done" 保存，应用会自动拉取节点列表。\n5. 选择一个节点，打开顶部的连接开关即可。' 
    },
    { 
        id: 'tut_3', 
        title: 'V2RayU (macOS) 使用教程',
        content: '1. 下载并安装 V2RayU。\n2. 点击菜单栏的图标，选择 “订阅设置”。\n3. 在地址栏输入您的订阅地址，点击 “添加”。\n4. 返回主菜单，点击 “更新订阅”。\n5. 更新成功后，在 “服务器列表” 中选择节点，然后选择 “打开V2RayU” 即可。' 
    },
];

export const mockAnnouncements: Announcement[] = [
    { id: 'anno_1', title: '系统维护通知', date: '2024-07-01', content: '为了提供更优质的服务，我们将于2024年7月5日凌晨2点至4点进行系统维护，期间服务可能会中断。' },
    { id: 'anno_2', title: '夏季促销活动上线', date: '2024-06-25', content: '炎炎夏日，清凉献礼！年度、季度套餐限时8折优惠，活动截止日期8月31日。' },
    { id: 'anno_3', title: '新增美国节点', date: '2024-06-18', content: '我们新增了位于美国西海岸的CN2 GIA高速节点，欢迎体验。' },
];

export const mockAffiliates: Omit<Affiliate, 'name'> & { userId: string }[] = [
    { id: 'aff_1', userId: 'usr_2', referralCount: 15, totalCommission: 350.75, pendingCommission: 120.50 },
    { id: 'aff_2', userId: 'usr_6', referralCount: 8, totalCommission: 180.00, pendingCommission: 50.00 },
    { id: 'aff_3', userId: 'usr_5', referralCount: 2, totalCommission: 45.25, pendingCommission: 15.00 },
];
