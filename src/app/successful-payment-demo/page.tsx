'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';
import { Copy, CheckCircle } from 'lucide-react';

export default function SuccessfulPaymentDemo() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  // 之前成功的支付响应数据
  const successfulPaymentData = {
    code: 1,
    trade_no: "2025110602574175477",
    payurl: "https://getype.kc2.top/ert/submit/2025110602574270843/"
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      toast({
        title: "已复制",
        description: "链接已复制到剪贴板",
      });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">成功支付演示</h1>
      <p className="text-muted-foreground mb-6">
        重现之前成功的支付响应代码
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-card rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">成功响应数据</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">响应代码 (code)</label>
                <div className="mt-1 p-3 bg-muted rounded font-mono">
                  {successfulPaymentData.code}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">交易号 (trade_no)</label>
                <div className="mt-1 p-3 bg-muted rounded font-mono break-all">
                  {successfulPaymentData.trade_no}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">支付链接 (payurl)</label>
                <div className="mt-1 p-3 bg-muted rounded font-mono break-all flex items-start gap-2">
                  <span className="flex-1 break-all">{successfulPaymentData.payurl}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(successfulPaymentData.payurl)}
                  >
                    {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-blue-50 rounded-lg border">
            <h3 className="font-semibold mb-2">成功响应JSON</h3>
            <pre className="bg-background p-4 rounded overflow-x-auto text-sm">
{`{
  "code": 1,
  "trade_no": "2025110602574175477",
  "payurl": "https://getype.kc2.top/ert/submit/2025110602574270843/"
}`}
            </pre>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg border flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">支付二维码</h2>
            <div className="p-4 bg-white rounded-lg border">
              <QRCode
                value={successfulPaymentData.payurl}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="L"
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground text-center">
              这是之前成功支付生成的二维码
            </p>
            <Button 
              className="mt-4" 
              onClick={() => window.open(successfulPaymentData.payurl, '_blank')}
            >
              在新窗口打开支付页面
            </Button>
          </div>
          
          <div className="p-6 bg-green-50 rounded-lg border">
            <h3 className="font-semibold mb-2">成功要素分析</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>code: 1</strong> - 表示请求成功</li>
              <li><strong>trade_no</strong> - 平台交易号，唯一标识</li>
              <li><strong>payurl</strong> - 有效的支付链接</li>
              <li>签名验证通过</li>
              <li>参数完整且格式正确</li>
              <li>timestamp参数正确包含</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">如何重现成功</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">必要参数</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>正确的商户ID (pid)</li>
              <li>有效的商户密钥 (key)</li>
              <li>完整的订单信息</li>
              <li>timestamp时间戳参数</li>
              <li>正确的签名算法</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">关键要点</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>确保所有参数参与签名计算</li>
              <li>参数按ASCII码排序</li>
              <li>签名字符串末尾拼接商户密钥</li>
              <li>使用MD5加密算法</li>
              <li>返回小写32位MD5值</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}