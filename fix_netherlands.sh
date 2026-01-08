#!/bin/bash

# 荷兰国家名称统一修复脚本
# 用于修正Firebase中荷兰的各种变体名称

echo "🇳🇱 荷兰国家名称统一修复脚本"
echo "================================"
echo ""

echo "此脚本将修正Firebase数据库中荷兰的各种变体名称："
echo "• 'the netherland' -> '荷兰'"
echo "• 'netherland' -> '荷兰'"
echo "• 'holland' -> '荷兰'"
echo "• 'nl' -> '荷兰'"
echo "• 'netherlands' -> '荷兰'"
echo ""

echo "⚠️  注意：需要有效的代理连接才能访问Firebase"
echo ""

read -p "是否继续运行修复？(y/N): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo ""
    echo "🔧 运行模拟修复（不修改数据）..."
    echo ""

    # 设置代理（如果需要）
    export HTTP_PROXY=http://127.0.0.1:7890
    export HTTPS_PROXY=http://127.0.0.1:7890

    # 运行修复脚本的模拟模式
    node diagnose_and_fix.js --fix --dry-run

    echo ""
    echo "📊 模拟完成！"
    echo ""
    echo "如果看到荷兰相关的修正记录，说明功能正常。"
    echo "要实际应用修复，请运行："
    echo "  node diagnose_and_fix.js --fix"
    echo ""

else
    echo ""
    echo "❌ 已取消"
    echo ""
    echo "如需手动修复，可以通过Firebase Console操作："
    echo "https://console.firebase.google.com/project/visitmap-f9bb2/firestore"
    echo ""
fi
