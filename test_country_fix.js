const admin = require('firebase-admin');

// 初始化Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'visitmap-f9bb2'
});

const db = admin.firestore();

// 标准化国家名称，处理不同API返回的变体
function normalizeCountryName(country) {
  if (!country || country === 'Unknown') return 'Unknown';

  const normalized = country.toLowerCase().trim();

  // 荷兰的各种变体
  if (normalized.includes('netherland') || normalized.includes('holland') || normalized === 'nl') {
    return '荷兰';
  }

  // 其他常见国家名称标准化
  const countryMap = {
    'united states': '美国',
    'usa': '美国',
    'us': '美国',
    'america': '美国',
    'united kingdom': '英国',
    'uk': '英国',
    'great britain': '英国',
    'england': '英国',
    'china': '中国',
    'japan': '日本',
    'korea': '韩国',
    'south korea': '韩国',
    'germany': '德国',
    'france': '法国',
    'italy': '意大利',
    'spain': '西班牙',
    'canada': '加拿大',
    'australia': '澳大利亚',
    'singapore': '新加坡',
    'thailand': '泰国',
    'vietnam': '越南',
    'indonesia': '印度尼西亚',
    'malaysia': '马来西亚',
    'philippines': '菲律宾',
    'india': '印度',
    'russia': '俄罗斯',
    'brazil': '巴西',
    'mexico': '墨西哥',
    'argentina': '阿根廷',
    'chile': '智利',
    'peru': '秘鲁',
    'colombia': '哥伦比亚',
    'turkey': '土耳其',
    'saudi arabia': '沙特阿拉伯',
    'uae': '阿联酋',
    'united arab emirates': '阿联酋',
    'south africa': '南非',
    'egypt': '埃及',
    'morocco': '摩洛哥',
    'nigeria': '尼日利亚',
    'kenya': '肯尼亚',
    'ghana': '加纳',
    'ethiopia': '埃塞俄比亚'
  };

  return countryMap[normalized] || country;
}

async function testCountryNormalization() {
  console.log('🧪 测试国家名称标准化功能\n');

  // 测试荷兰的各种变体
  const testCases = [
    'the netherland',
    'netherland',
    'Netherland',
    'THE NETHERLAND',
    'holland',
    'Holland',
    'nl',
    'NL',
    'Netherlands',
    'netherlands'
  ];

  console.log('荷兰变体测试:');
  testCases.forEach(testCase => {
    const result = normalizeCountryName(testCase);
    console.log(`  "${testCase}" -> "${result}"`);
  });

  console.log('\n其他国家测试:');
  const otherTests = ['United States', 'USA', 'UK', 'China', 'Japan'];
  otherTests.forEach(testCase => {
    const result = normalizeCountryName(testCase);
    console.log(`  "${testCase}" -> "${result}"`);
  });
}

async function checkNetherlandsData() {
  console.log('\n🔍 检查Firebase中的荷兰数据\n');

  try {
    const snapshot = await db.collection('visits')
      .where('country', '>=', 'nether')
      .where('country', '<=', 'nether' + '\uf8ff')
      .limit(20)
      .get();

    if (snapshot.empty) {
      console.log('未找到荷兰相关记录');
      return;
    }

    console.log(`找到 ${snapshot.size} 条可能相关的记录:`);

    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. 国家: "${data.country}", 城市: "${data.city}", IP: ${data.ip}`);
    });

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  }
}

async function main() {
  try {
    await testCountryNormalization();
    await checkNetherlandsData();

    console.log('\n✅ 测试完成!\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
  } finally {
    await admin.app().delete();
  }
}

main();
