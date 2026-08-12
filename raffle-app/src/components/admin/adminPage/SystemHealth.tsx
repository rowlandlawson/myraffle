'use client';

import { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface HealthItem {
  label: string;
  value: string;
  status: 'healthy' | 'error' | 'warning';
}

export default function SystemHealth() {
  const [items, setItems] = useState<HealthItem[]>([
    { label: 'Server Uptime', value: 'Checking...', status: 'healthy' },
    { label: 'Database Status', value: 'Checking...', status: 'healthy' },
    { label: 'Payment Gateway', value: 'Checking...', status: 'healthy' },
    { label: 'Email Service', value: 'Checking...', status: 'healthy' },
  ]);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.services && Array.isArray(data.services)) {
          setItems(data.services);
        }
      } else {
        setItems([
          { label: 'Server Uptime', value: 'Offline', status: 'error' },
          { label: 'Database Status', value: 'Unknown', status: 'error' },
          { label: 'Payment Gateway', value: 'Unknown', status: 'error' },
          { label: 'Email Service', value: 'Unknown', status: 'error' },
        ]);
      }
    } catch {
      setItems([
        { label: 'Server Uptime', value: 'Disconnected', status: 'error' },
        { label: 'Database Status', value: 'Unreachable', status: 'error' },
        { label: 'Payment Gateway', value: 'Unreachable', status: 'error' },
        { label: 'Email Service', value: 'Unreachable', status: 'error' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Clock size={20} /> System Status
        </h3>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
          title="Refresh health status"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">{item.label}</span>
            <span
              className={`font-bold ${
                item.status === 'healthy'
                  ? 'text-emerald-600'
                  : item.status === 'warning'
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
