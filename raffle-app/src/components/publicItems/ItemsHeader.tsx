interface ItemsHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function ItemsHeader({
  title = 'Browse All Items',
  subtitle = 'Find your next winning raffle ticket',
}: ItemsHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}
