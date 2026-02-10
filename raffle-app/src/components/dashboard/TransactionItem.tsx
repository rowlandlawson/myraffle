import { ArrowUpRight, ArrowDownLeft, Zap } from 'lucide-react';

interface TransactionItemProps {
  transaction: {
    id: number;
    type: 'deposit' | 'withdrawal' | 'purchase' | 'reward';
    description: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending';
  };
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const getIconBg = () => {
    switch (transaction.type) {
      case 'deposit':
        return 'bg-green-100';
      case 'withdrawal':
        return 'bg-red-100';
      case 'purchase':
        return 'bg-blue-100';
      case 'reward':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  const renderIcon = () => {
    switch (transaction.type) {
      case 'deposit':
        return <ArrowDownLeft className="text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="text-red-600" />;
      case 'purchase':
        return <span>🎫</span>;
      case 'reward':
        return <Zap className="text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBg()}`}
      >
        {renderIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 truncate">
          {transaction.description}
        </div>
        <div className="text-xs text-gray-600">{transaction.date}</div>
      </div>
      <div className="text-right">
        <div
          className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}
        >
          {transaction.amount > 0 ? '+' : ''}₦
          {Math.abs(transaction.amount).toLocaleString()}
        </div>
        <div
          className={`text-xs font-semibold ${transaction.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}
        >
          {transaction.status === 'completed' ? '✓' : '⏳'} {transaction.status}
        </div>
      </div>
    </div>
  );
}
