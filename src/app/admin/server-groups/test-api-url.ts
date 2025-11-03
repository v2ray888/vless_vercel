import { getServerGroups } from './actions';

async function testApiUrl() {
  try {
    const groups = await getServerGroups();
    console.log('服务器组列表:');
    groups.forEach(group => {
      console.log(`- ${group.name}: apiUrl = ${group.apiUrl}`);
    });
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testApiUrl();