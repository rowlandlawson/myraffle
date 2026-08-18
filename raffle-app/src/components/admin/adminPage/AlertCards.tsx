import AlertCard from '@/components/ui/AlertCard';
import { useRouter } from 'next/navigation';

interface AlertData {
  unclaimedWins?: number;
  failedTransactions: number;
}

interface AlertCardsProps {
  alerts: AlertData;
}

export default function AlertCards({ alerts }: AlertCardsProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {alerts.unclaimedWins && alerts.unclaimedWins > 0 ? (
        <AlertCard
          type="warning"
          title="Unclaimed / Pending Wins"
          message={`${alerts.unclaimedWins} won raffle items pending delivery or store credit conversion`}
          actionText="Manage Wins"
          onAction={() => router.push('/admin/wins')}
        />
      ) : null}

      {alerts.failedTransactions > 0 && (
        <AlertCard
          type="error"
          title="Failed Transactions"
          message={`${alerts.failedTransactions} transactions failed and need review`}
          actionText="Review"
          onAction={() => router.push('/admin/transactions')}
        />
      )}
    </div>
  );
}
