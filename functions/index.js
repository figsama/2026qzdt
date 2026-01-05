const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * 聚合访问统计数据
 * 定期运行（建议每小时或每天），将 visits 集合的数据聚合到 aggregated_stats 集合
 */
exports.aggregateVisitStats = functions.pubsub
  .schedule('every 1 hours') // 每小时运行一次，可以根据需要调整
  .timeZone('Asia/Shanghai')
  .onRun(async (context) => {
    const db = admin.firestore();
    
    try {
      console.log('开始聚合访问统计数据...');
      
      // 获取所有访问记录
      const visitsSnapshot = await db.collection('visits')
        .limit(10000) // 限制最多处理10000条记录
        .get();
      
      if (visitsSnapshot.empty) {
        console.log('没有访问数据');
        return null;
      }
      
      const visits = [];
      visitsSnapshot.forEach(doc => {
        visits.push(doc.data());
      });
      
      // 计算统计数据
      const stats = {
        totalVisits: visits.length,
        uniqueIPs: new Set(visits.map(v => v.ip)).size,
        countries: {},
        cities: {},
        countryVisits: {}, // 按国家代码统计，用于地图显示
        visitsByDate: {},
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // 统计国家和城市
      visits.forEach(visit => {
        const country = visit.country || 'Unknown';
        const countryCode = visit.countryCode || 'XX';
        const city = visit.city || 'Unknown';
        
        // 统计国家
        stats.countries[country] = (stats.countries[country] || 0) + 1;
        
        // 统计城市
        stats.cities[city] = (stats.cities[city] || 0) + 1;
        
        // 按国家代码统计（用于地图）
        if (!stats.countryVisits[countryCode]) {
          stats.countryVisits[countryCode] = {
            count: 0,
            country: country
          };
        }
        stats.countryVisits[countryCode].count++;
        
        // 统计日期
        const date = visit.date || (visit.createdAt?.toDate ? visit.createdAt.toDate().toDateString() : new Date().toDateString());
        stats.visitsByDate[date] = (stats.visitsByDate[date] || 0) + 1;
      });
      
      // 计算访问最多的国家（前10名）
      stats.topCountries = Object.entries(stats.countries)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([country, count]) => ({ country, count }));
      
      // 计算访问最多的城市（前10名）
      stats.topCities = Object.entries(stats.cities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([city, count]) => ({ city, count }));
      
      // 添加国家数量
      stats.countriesCount = Object.keys(stats.countries).length;
      
      // 保存聚合数据到 aggregated_stats 集合
      await db.collection('aggregated_stats').doc('current').set(stats, { merge: false });
      
      console.log(`聚合完成: 总访问量=${stats.totalVisits}, 独立IP=${stats.uniqueIPs}, 国家数=${stats.countriesCount}`);
      
      return null;
    } catch (error) {
      console.error('聚合统计数据失败:', error);
      throw error;
    }
  });

/**
 * 手动触发聚合函数（用于测试）
 * 可以通过 HTTP 请求触发: https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/manualAggregateStats
 */
exports.manualAggregateStats = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  
  try {
    console.log('手动触发聚合访问统计数据...');
    
    // 获取所有访问记录
    const visitsSnapshot = await db.collection('visits')
      .limit(10000)
      .get();
    
    if (visitsSnapshot.empty) {
      res.json({ success: true, message: '没有访问数据' });
      return;
    }
    
    const visits = [];
    visitsSnapshot.forEach(doc => {
      visits.push(doc.data());
    });
    
    // 计算统计数据
    const stats = {
      totalVisits: visits.length,
      uniqueIPs: new Set(visits.map(v => v.ip)).size,
      countries: {},
      cities: {},
      countryVisits: {},
      visitsByDate: {},
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // 统计国家和城市
    visits.forEach(visit => {
      const country = visit.country || 'Unknown';
      const countryCode = visit.countryCode || 'XX';
      const city = visit.city || 'Unknown';
      
      stats.countries[country] = (stats.countries[country] || 0) + 1;
      stats.cities[city] = (stats.cities[city] || 0) + 1;
      
      if (!stats.countryVisits[countryCode]) {
        stats.countryVisits[countryCode] = {
          count: 0,
          country: country
        };
      }
      stats.countryVisits[countryCode].count++;
      
      const date = visit.date || (visit.createdAt?.toDate ? visit.createdAt.toDate().toDateString() : new Date().toDateString());
      stats.visitsByDate[date] = (stats.visitsByDate[date] || 0) + 1;
    });
    
    // 计算访问最多的国家和城市
    stats.topCountries = Object.entries(stats.countries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));
    
    stats.topCities = Object.entries(stats.cities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));
    
    stats.countriesCount = Object.keys(stats.countries).length;
    
    // 保存聚合数据
    await db.collection('aggregated_stats').doc('current').set(stats, { merge: false });
    
    res.json({
      success: true,
      message: '聚合完成',
      stats: {
        totalVisits: stats.totalVisits,
        uniqueIPs: stats.uniqueIPs,
        countriesCount: stats.countriesCount
      }
    });
  } catch (error) {
    console.error('聚合统计数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

