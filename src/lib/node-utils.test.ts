import { parseNodeText, formatNodeText } from './node-utils';

// 测试数据
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

console.log('输入文本:');
console.log(testNodeText);

console.log('\n解析结果:');
const parsedNodes = parseNodeText(testNodeText);
console.log(JSON.stringify(parsedNodes, null, 2));

console.log('\n格式化回文本:');
const formattedText = formatNodeText(parsedNodes);
console.log(formattedText);

console.log('\n解析的节点数量:', parsedNodes.length);