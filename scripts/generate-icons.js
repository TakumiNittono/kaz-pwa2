/**
 * SVGアイコンからPNGアイコンを生成するスクリプト
 * 
 * 使用方法:
 * npm install --save-dev sharp
 * node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

async function generateIcons() {
  try {
    // sharpがインストールされているか確認
    let sharp;
    try {
      sharp = require('sharp');
    } catch (error) {
      console.error('❌ sharpがインストールされていません。');
      console.log('以下のコマンドでインストールしてください:');
      console.log('npm install --save-dev sharp');
      process.exit(1);
    }

    const publicDir = path.join(process.cwd(), 'public');
    const svgPath = path.join(publicDir, 'icon.svg');

    // SVGファイルが存在するか確認
    if (!fs.existsSync(svgPath)) {
      console.error('❌ icon.svgが見つかりません:', svgPath);
      process.exit(1);
    }

    console.log('🎨 アイコンを生成中...');

    // 192x192のアイコンを生成
    await sharp(svgPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));

    console.log('✅ icon-192.png を生成しました');

    // 512x512のアイコンを生成
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));

    console.log('✅ icon-512.png を生成しました');

    // 180x180のアイコンを生成（iOS用）
    await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'icon-180.png'));

    console.log('✅ icon-180.png を生成しました（iOS用）');

    // favicon.icoを生成（32x32）
    await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));

    console.log('✅ favicon.png を生成しました');

    console.log('\n🎉 すべてのアイコンを生成しました！');
    console.log('\n生成されたファイル:');
    console.log('  - public/icon-192.png');
    console.log('  - public/icon-512.png');
    console.log('  - public/icon-180.png');
    console.log('  - public/favicon.png');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

generateIcons();

