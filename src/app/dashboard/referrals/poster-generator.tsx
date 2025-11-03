'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

interface PosterGeneratorProps {
  referralLink: string;
  referralCode: string;
}

export function PosterGenerator({ referralLink, referralCode }: PosterGeneratorProps) {
  const { toast } = useToast();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 生成二维码数据URL
  useEffect(() => {
    if (referralLink) {
      QRCode.toDataURL(referralLink, { 
        width: 300, 
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => {
          console.error('生成二维码失败:', err);
          toast({
            title: '生成失败',
            description: '生成二维码时发生错误',
            variant: 'destructive'
          });
        });
    }
  }, [referralLink, toast]);

  // 直接生成并下载海报
  const generatePoster = async () => {
    if (!qrCodeDataUrl) {
      toast({
        title: '生成失败',
        description: '二维码尚未准备就绪',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // 创建canvas元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('无法获取canvas上下文');
      }

      // 设置canvas尺寸
      canvas.width = 600;
      canvas.height = 800;

      // 创建渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#dbeafe'); // 蓝色浅色
      gradient.addColorStop(1, '#f3e8ff'); // 紫色浅色
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 添加标题
      ctx.fillStyle = '#1f2937'; // 深灰色
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('邀请您加入', canvas.width / 2, 80);

      // 添加副标题
      ctx.fillStyle = '#4b5563'; // 灰色
      ctx.font = '24px Arial, sans-serif';
      ctx.fillText('优质网络服务，畅享极速体验', canvas.width / 2, 130);

      // 添加二维码
      const qrImg = new Image();
      qrImg.crossOrigin = 'Anonymous';
      qrImg.src = qrCodeDataUrl;
      
      // 等待二维码图片加载完成
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
      });

      // 绘制二维码（居中）
      const qrSize = 300;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 180;
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // 添加二维码边框
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.strokeRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);

      // 添加说明文字
      ctx.fillStyle = '#4b5563';
      ctx.font = '20px Arial, sans-serif';
      ctx.fillText('扫码或点击链接立即注册', canvas.width / 2, qrY + qrSize + 50);

      // 添加链接（分多行显示）
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px monospace';
      
      // 将链接分成多行显示
      const maxWidth = 500;
      const words = referralLink.split('');
      let line = '';
      let y = qrY + qrSize + 90;
      const lineHeight = 20;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n];
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[n];
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);

      // 添加推广码信息
      y += 60;
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Arial, sans-serif';
      ctx.fillText(`推广码: ${referralCode}`, canvas.width / 2, y);

      // 转换为图片并下载
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `推广海报-${referralCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: '生成成功',
        description: '推广海报已开始下载'
      });
    } catch (error) {
      console.error('生成海报失败:', error);
      toast({
        title: '生成失败',
        description: '生成海报时发生错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 显示的海报预览元素 */}
      <div className="flex flex-col items-center">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg w-full max-w-md mx-auto shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">邀请您加入</h2>
            <p className="text-gray-600 mb-4">优质网络服务，畅享极速体验</p>
            
            <div className="bg-white p-4 rounded-lg shadow-md inline-block my-4">
              <div className="flex justify-center">
                {/* 使用img元素显示二维码，确保用户可以看到预览 */}
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="推广二维码" 
                    className="w-32 h-32"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-gray-100 rounded">
                    <div className="text-gray-400">二维码生成中...</div>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              扫码或点击链接立即注册
            </p>
            <p className="text-xs text-gray-500 mt-2 font-mono break-all">
              {referralLink}
            </p>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                推广码: {referralCode}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={generatePoster} 
        className="w-full" 
        disabled={!qrCodeDataUrl || isGenerating}
      >
        {isGenerating ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            生成中...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            生成推广海报并下载
          </>
        )}
      </Button>
    </div>
  );
}