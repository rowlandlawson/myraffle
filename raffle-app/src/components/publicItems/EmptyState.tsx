interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({
  title = 'No items found',
  message = 'Try adjusting your filters or search term',
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">🔍</div>
      <p className="text-gray-600 text-lg">{title}</p>
      <p className="text-gray-500 text-sm mt-2">{message}</p>
    </div>
  );
}
