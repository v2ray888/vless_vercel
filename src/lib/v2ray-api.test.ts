import { getV2RayStatus, getV2RayUUIDs, addV2RayUUID, removeV2RayUUID, validateV2RayUUID } from './v2ray-api';

// 测试配置（请根据实际情况修改）
const testConfig = {
  apiUrl: 'http://localhost:9090', // 替换为实际的API地址
  apiKey: 'your-api-key-here'      // 替换为实际的API密钥
};

// 测试UUID
const testUUID = '12345678-1234-1234-1234-123456789012';

async function runTests() {
  console.log('开始测试V2Ray API...');
  
  // 测试获取服务状态
  console.log('\n1. 测试获取服务状态...');
  try {
    const statusResult = await getV2RayStatus(testConfig);
    console.log('状态结果:', statusResult);
  } catch (error) {
    console.error('获取服务状态失败:', error);
  }
  
  // 测试获取UUID列表
  console.log('\n2. 测试获取UUID列表...');
  try {
    const uuidsResult = await getV2RayUUIDs(testConfig);
    console.log('UUID列表结果:', uuidsResult);
  } catch (error) {
    console.error('获取UUID列表失败:', error);
  }
  
  // 测试添加UUID
  console.log('\n3. 测试添加UUID...');
  try {
    const addResult = await addV2RayUUID(testConfig, testUUID);
    console.log('添加UUID结果:', addResult);
  } catch (error) {
    console.error('添加UUID失败:', error);
  }
  
  // 测试验证UUID
  console.log('\n4. 测试验证UUID...');
  try {
    const validateResult = await validateV2RayUUID(testConfig, testUUID);
    console.log('验证UUID结果:', validateResult);
  } catch (error) {
    console.error('验证UUID失败:', error);
  }
  
  // 测试删除UUID
  console.log('\n5. 测试删除UUID...');
  try {
    const removeResult = await removeV2RayUUID(testConfig, testUUID);
    console.log('删除UUID结果:', removeResult);
  } catch (error) {
    console.error('删除UUID失败:', error);
  }
  
  console.log('\n测试完成。');
}

// 运行测试
runTests();