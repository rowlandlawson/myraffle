import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import type { AdminTransaction } from '@/lib/hooks/useAdmin';

interface RecentTransactionsProps {
    transactions: AdminTransaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h2>
                <div className="text-sm text-gray-500 text-center py-8">
                    No recent transactions found
                </div>
            </div>
        );
    }

    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'DEPOSIT':
            case 'RAFFLE_WIN':
            case 'TASK_REWARD':
                return { color: 'text-green-600', bg: 'bg-green-50', icon: ArrowDownRight };
            case 'WITHDRAWAL':
            case 'TICKET_PURCHASE':
                return { color: 'text-red-600', bg: 'bg-red-50', icon: ArrowUpRight };
            default:
                return { color: 'text-gray-600', bg: 'bg-gray-50', icon: Clock };
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            COMPLETED: 'bg-green-100 text-green-700',
            PENDING: 'bg-yellow-100 text-yellow-700',
            FAILED: 'bg-red-100 text-red-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h2>
            <div className="space-y-2">
                {transactions.slice(0, 8).map((tx) => {
                    const style = getTypeStyle(tx.type);
                    const Icon = style.icon;
                    const date = new Date(tx.createdAt).toLocaleDateString('en-NG', {
                        month: 'short', day: 'numeric',
                    });

                    return (
                        <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                            <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center`}>
                                <Icon size={16} className={style.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {tx.type.replace(/_/g, ' ')}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {tx.user.name} · {date}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-bold ${style.color}`}>
                                    ₦{tx.amount.toLocaleString()}
                                </p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getStatusBadge(tx.status)}`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
