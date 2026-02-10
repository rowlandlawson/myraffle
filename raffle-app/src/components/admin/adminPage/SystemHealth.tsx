import { Clock } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function SystemHealth() {
  const healthItems = [
    { label: 'Server Uptime', value: '99.9%', status: 'healthy' },
    { label: 'Database Status', value: '✓ Healthy', status: 'healthy' },
    { label: 'Payment Gateway', value: '✓ Connected', status: 'healthy' },
    { label: 'Email Service', value: '✓ Active', status: 'healthy' },
  ];

  return (
    <Card>
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock size={20} /> System Status
      </h3>
      <div className="space-y-3">
        {healthItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-gray-600">{item.label}</span>
            <span
              className={`font-bold ${
                item.status === 'healthy' ? 'text-green-600' : 'text-red-600'
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
