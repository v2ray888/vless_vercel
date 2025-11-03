const fs = require('fs');
const path = require('path');

// 动态导入编译后的node-utils.js
const nodeUtilsPath = path.join(__dirname, 'node-utils.js');

// 如果node-utils.js不存在，先编译
if (!fs.existsSync(nodeUtilsPath)) {
  console.log('正在编译node-utils.ts...');
  const { execSync } = require('child_process');
  execSync('npx tsc src/lib/node-utils.ts --declaration false --outDir src/lib', { stdio: 'inherit' });
}

const { parseNodeText, formatNodeText } = require('./node-utils');

// 测试节点文本解析
const testNodeText = `8.39.125.153:2053#SG 官方优选 65ms
8.35.211.239:2053#SG 官方优选 67ms
172.64.52.58:2053#SG 官方优选 67ms
162.159.35.75:2053#SG 官方优选 68ms
172.64.157.154:2053#SG 官方优选 68ms
37.153.171.94:2053#US 官方优选 166ms
64.239.31.202:2053#US 官方优选 166ms
23.227.60.82:2053#US 官方优选 167ms
45.196.29.73:2053#US 官方优选 167ms
154.81.141.58:2053#US 官方优选 167ms
94.156.10.102:2053#US 官方优选 168ms
162.159.237.200:2053#US 官方优选 168ms`;

console.log('测试节点文本解析:');
const parsedNodes = parseNodeText(testNodeText);
console.log('解析结果数量:', parsedNodes.length);
console.log('解析结果:', JSON.stringify(parsedNodes, null, 2));

console.log('\n测试节点格式化:');
const formattedText = formatNodeText(parsedNodes);
console.log('格式化结果:\n' + formattedText);

// 验证解析结果
console.log('\n验证解析结果:');
console.log('节点数量:', parsedNodes.length);
if (parsedNodes.length > 0) {
  console.log('第一个节点:', JSON.stringify(parsedNodes[0], null, 2));
  console.log('最后一个节点:', JSON.stringify(parsedNodes[parsedNodes.length - 1], null, 2));
}