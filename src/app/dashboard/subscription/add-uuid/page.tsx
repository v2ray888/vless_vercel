'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddUuidPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 从URL参数中获取token
  const getTokenFromUrl = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('token');
    }
    return null;
  };
  
  const handleAddUuid = async () => {
    setLoading(true);
    const token = getTokenFromUrl();
    
    if (!token) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "未找到订阅令牌",
      });
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/add-uuid-to-v2ray', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "成功",
          description: "UUID已成功添加到V2Ray面板",
        });
        // 返回订阅管理页面
        setTimeout(() => {
          router.push('/dashboard/subscription');
        }, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "失败",
          description: result.error || result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "请求失败",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">添加UUID到V2Ray面板</h1>
        <p className="mb-6 text-gray-600">
          订阅的UUID未在V2Ray面板中找到，点击下面的按钮将其添加到面板中。
        </p>
        <Button 
          onClick={handleAddUuid} 
          disabled={loading}
          className="w-full"
        >
          {loading ? '处理中...' : '添加UUID'}
        </Button>
      </div>
    </div>
  );
}