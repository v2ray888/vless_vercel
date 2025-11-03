import { getServerGroups } from './actions';

async function testApiKey() {
  try {
    const groups = await getServerGroups();
    console.log('服务器组列表:');
    groups.forEach(group => {
      console.log(`- ${group.name}: apiKey = ${group.apiKey}`);
    });
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testApiKey();