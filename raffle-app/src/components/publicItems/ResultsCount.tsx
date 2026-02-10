interface ResultsCountProps {
  count: number;
  total?: number;
}

export default function ResultsCount({ count, total }: ResultsCountProps) {
  return (
    <div className="mb-6">
      <p className="text-gray-600">
        Showing <span className="font-bold text-gray-900">{count}</span> active
        items
        {total && count !== total && (
          <span>
            {' '}
            of <span className="font-bold text-gray-900">{total}</span>
          </span>
        )}
      </p>
    </div>
  );
}
