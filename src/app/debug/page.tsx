'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnvInfo = async () => {
      try {
        const response = await fetch('/api/debug-env-info');
        const data = await response.json();
        setEnvInfo(data);
      } catch (error) {
        console.error('Failed to fetch env info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnvInfo();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">环境变量调试信息</h1>
      {envInfo ? (
        <div className="bg-gray-100 p-4 rounded">
          <pre>{JSON.stringify(envInfo, null, 2)}</pre>
        </div>
      ) : (
        <p>无法获取环境变量信息</p>
      )}
    </div>
  );
}