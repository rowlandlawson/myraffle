type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'purchase'
  | 'reward'
  | 'refund';

interface WalletTransactionRowProps {
  transaction: {
    id: number;
    type: TransactionType;
    description: string;
    amount: number;
    date: string;
    time: string;
    status: 'completed' | 'pending';
    reference: string;
  };
}

export default function WalletTransactionRow({
  transaction,
}: WalletTransactionRowProps) {
  const getTransactionIcon = (type: TransactionType): string => {
    switch (type) {
      case 'deposit':
        return '⬇️';
      case 'withdrawal':
        return '⬆️';
      case 'purchase':
        return '🎫';
      case 'reward':
        return '⚡';
      case 'refund':
        return '↩️';
      default:
        return '💰';
    }
  };

  const getTransactionColor = (type: TransactionType): string => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100 text-green-700';
      case 'withdrawal':
        return 'bg-red-100 text-red-700';
      case 'purchase':
        return 'bg-blue-100 text-blue-700';
      case 'reward':
        return 'bg-yellow-100 text-yellow-700';
      case 'refund':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition">
      <td className="px-4 py-4">
        <span
          className={`inline-block w-10 h-10 rounded-full ${getTransactionColor(transaction.type)} flex items-center justify-center font-bold text-lg`}
        >
          {getTransactionIcon(transaction.type)}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="font-semibold text-gray-900">
          {transaction.description}
        </div>
      </td>
      <td className="px-4 py-4 text-gray-600 text-sm">
        <div>{transaction.date}</div>
        <div className="text-xs text-gray-500">{transaction.time}</div>
      </td>
      <td className="px-4 py-4 text-gray-600 text-sm font-mono">
        {transaction.reference}
      </td>
      <td className="px-4 py-4 text-right">
        <div
          className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}
        >
          {transaction.amount > 0 ? '+' : ''}₦
          {Math.abs(transaction.amount).toLocaleString()}
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            transaction.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {transaction.status === 'completed' ? '✓ Done' : '⏳ Pending'}
        </span>
      </td>
    </tr>
  );
}
