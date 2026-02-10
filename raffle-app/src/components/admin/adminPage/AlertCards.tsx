import AlertCard from '@/components/ui/AlertCard';

interface AlertData {
  pendingPayouts: number;
  failedTransactions: number;
}

interface AlertCardsProps {
  alerts: AlertData;
}

export default function AlertCards({ alerts }: AlertCardsProps) {
  return (
    <div className="space-y-4">
      {alerts.pendingPayouts > 0 && (
        <AlertCard
          type="warning"
          title="Pending Payouts"
          message={`₦${(alerts.pendingPayouts / 1000000).toFixed(2)}M pending payout to ${Math.ceil(alerts.pendingPayouts / 15000)} users`}
          actionText="Process Now"
          onAction={() => console.log('Process payouts')}
        />
      )}

      {alerts.failedTransactions > 0 && (
        <AlertCard
          type="error"
          title="Failed Transactions"
          message={`${alerts.failedTransactions} transactions failed and need review`}
          actionText="Review"
          onAction={() => console.log('Review transactions')}
        />
      )}
    </div>
  );
}
