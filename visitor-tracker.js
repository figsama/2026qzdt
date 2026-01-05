/**
 * 网站访客追踪脚本
 * 用于记录访客的地理位置信息到 Firebase
 * 
 * 使用方法：
 * 1. 在 HTML 中引入 Firebase SDK
 * 2. 配置 Firebase
 * 3. 引入此脚本
 */

(function() {
  'use strict';

  // Firebase 配置 - 已配置为 visamap-884ae 项目
  const firebaseConfig = {
    apiKey: "AIzaSyDIyz1W_TnhtNgaNQkPNv131plJPoL4pwE",
    authDomain: "visamap-884ae.firebaseapp.com",
    projectId: "visamap-884ae",
    storageBucket: "visamap-884ae.firebasestorage.app",
    messagingSenderId: "755802981286",
    appId: "1:755802981286:web:f3c2a89009f4bf1d5dc567"
    // 注意：不包含 databaseURL（Realtime Database）
    // 注意：不包含 measurementId（Google Analytics）
    // 我们只使用 Firestore Database
  };

  // 配置已完成，无需检查
  // Firebase 项目：visamap-884ae

  // 初始化 Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();

  /**
   * 获取访客的地理位置信息
   * 使用多个免费 IP 定位 API
   */
  async function getVisitorLocation() {
    try {
      // 方案1: 使用 ipapi.co (每天1000次免费请求)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        ip: data.ip,
        city: data.city || '未知',
        region: data.region || '未知',
        country: data.country_name || '未知',
        countryCode: data.country_code || 'XX',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        timezone: data.timezone || 'UTC',
        org: data.org || '未知'
      };
    } catch (error1) {
      console.log('ipapi.co 失败，尝试备用方案...');
      
      try {
        // 方案2: 使用 ip-api.com (免费，无限制，但有速率限制)
        const response = await fetch('http://ip-api.com/json/?lang=zh-CN');
        const data = await response.json();
        
        if (data.status === 'success') {
          return {
            ip: data.query,
            city: data.city || '未知',
            region: data.regionName || '未知',
            country: data.country || '未知',
            countryCode: data.countryCode || 'XX',
            latitude: data.lat || 0,
            longitude: data.lon || 0,
            timezone: data.timezone || 'UTC',
            org: data.isp || '未知'
          };
        }
      } catch (error2) {
        console.log('ip-api.com 失败，尝试第三方案...');
        
        try {
          // 方案3: 使用 ipwhois.app (每月10000次免费)
          const response = await fetch('https://ipwhois.app/json/');
          const data = await response.json();
          
          return {
            ip: data.ip,
            city: data.city || '未知',
            region: data.region || '未知',
            country: data.country || '未知',
            countryCode: data.country_code || 'XX',
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            timezone: data.timezone || 'UTC',
            org: data.isp || '未知'
          };
        } catch (error3) {
          console.error('所有地理位置服务都失败了');
          // 返回默认值
          return {
            ip: '未知',
            city: '未知',
            region: '未知',
            country: '未知',
            countryCode: 'XX',
            latitude: 0,
            longitude: 0,
            timezone: 'UTC',
            org: '未知'
          };
        }
      }
    }
  }

  /**
   * 获取访客的浏览器和设备信息
   */
  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = '未知';
    let os = '未知';
    
    // 检测浏览器
    if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';
    else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) browser = 'IE';
    
    // 检测操作系统
    if (ua.indexOf('Windows') > -1) os = 'Windows';
    else if (ua.indexOf('Mac') > -1) os = 'macOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';
    
    return {
      browser,
      os,
      language: navigator.language || navigator.userLanguage || '未知',
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: ua
    };
  }

  /**
   * 记录访问信息到 Firebase
   */
  async function recordVisit() {
    try {
      // 检查是否在24小时内已记录过（避免重复计数）
      const lastVisit = localStorage.getItem('lastVisitTime');
      const now = new Date().getTime();
      
      if (lastVisit && (now - parseInt(lastVisit)) < 24 * 60 * 60 * 1000) {
        console.log('24小时内已记录过访问，跳过');
        return;
      }
      
      // 获取位置和设备信息
      const location = await getVisitorLocation();
      const device = getDeviceInfo();
      
      // 准备访问记录
      const visitData = {
        // 位置信息
        ip: location.ip,
        city: location.city,
        region: location.region,
        country: location.country,
        countryCode: location.countryCode,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        isp: location.org,
        
        // 设备信息
        browser: device.browser,
        os: device.os,
        language: device.language,
        screenResolution: device.screenResolution,
        viewport: device.viewport,
        
        // 访问信息
        url: window.location.href,
        referrer: document.referrer || '直接访问',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        
        // 用户代理（用于调试）
        userAgent: device.userAgent
      };
      
      // 保存到 Firebase
      await db.collection('visits').add(visitData);
      
      // 更新本地存储
      localStorage.setItem('lastVisitTime', now.toString());
      
      console.log('访问记录已保存:', visitData);
      
    } catch (error) {
      console.error('记录访问失败:', error);
    }
  }

  // 页面加载完成后记录访问
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', recordVisit);
  } else {
    recordVisit();
  }

})();
