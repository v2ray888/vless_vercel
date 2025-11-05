import { getSettings } from '@/app/admin/settings/actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 获取所有SEO相关设置
    const settingKeys = [
      'site_name',
      'site_description',
      'site_keywords',
      'site_author',
      'site_robots',
      'og_title',
      'og_description',
      'og_image',
      'og_type',
      'twitter_card',
      'twitter_site',
      'twitter_creator',
    ] as const;
    
    const settings = await getSettings([...settingKeys]);
    
    // 处理字符编码问题
    const decodedSettings: Record<string, string> = {};
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'string') {
        // 尝试解码可能的乱码
        try {
          // 如果字符串包含乱码特征，尝试重新编码
          if (value.includes('') || /[\x80-\xFF]/.test(value)) {
            // 这里我们直接使用原始值，因为乱码可能在存储时就已经产生
            decodedSettings[key] = value;
          } else {
            decodedSettings[key] = value;
          }
        } catch (decodeError) {
          // 如果解码失败，使用原始值
          decodedSettings[key] = value;
        }
      } else {
        decodedSettings[key] = value;
      }
    }
    
    return NextResponse.json({
      success: true,
      data: decodedSettings
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('Failed to fetch SEO settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch SEO settings'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  }
}