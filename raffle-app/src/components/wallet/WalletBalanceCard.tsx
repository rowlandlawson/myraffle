import Link from 'next/link';

interface WalletBalanceCardProps {
  balance: number;
  totalDeposited: string;
  totalSpent: string;
  pendingWithdrawal: string;
  totalEarnings: string;
}

export default function WalletBalanceCard({
  balance,
  totalDeposited,
  totalSpent,
  pendingWithdrawal,
  totalEarnings,
}: WalletBalanceCardProps) {
  return (
    <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white shadow-lg">
      <div className="mb-4">
        <p className="text-red-100 text-sm font-semibold">CURRENT BALANCE</p>
        <h1 className="text-3xl md:text-5xl font-bold">
          ₦{balance.toLocaleString()}
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-red-500">
        <div>
          <p className="text-red-100 text-xs">Total Deposited</p>
          <p className="text-2xl font-bold">{totalDeposited}</p>
        </div>
        <div>
          <p className="text-red-100 text-xs">Total Spent</p>
          <p className="text-2xl font-bold">{totalSpent}</p>
        </div>
        <div>
          <p className="text-red-100 text-xs">Pending Withdrawal</p>
          <p className="text-2xl font-bold">{pendingWithdrawal}</p>
        </div>
        <div>
          <p className="text-red-100 text-xs">Total Earnings</p>
          <p className="text-2xl font-bold">{totalEarnings}</p>
        </div>
      </div>
    </div>
  );
}
