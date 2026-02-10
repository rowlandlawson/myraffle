'use client';

import Card from '@/components/ui/Card';

interface QuickAction {
  label: string;
  color: 'red' | 'blue' | 'green' | 'purple';
  onClick: () => void;
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      label: 'Create New Raffle',
      color: 'red',
      onClick: () => console.log('Create raffle'),
    },
    {
      label: 'Send Announcement',
      color: 'blue',
      onClick: () => console.log('Send announcement'),
    },
    {
      label: 'Download Report',
      color: 'green',
      onClick: () => console.log('Download report'),
    },
    {
      label: 'View Analytics',
      color: 'purple',
      onClick: () => console.log('View analytics'),
    },
  ];

  const colorClasses = {
    red: 'bg-red-50 text-red-600 hover:bg-red-100',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  };

  return (
    <Card>
      <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition ${colorClasses[action.color]}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
