import Link from 'next/link';

export default function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center">
        <Link
          href="/"
          className="flex-1 text-center py-4 text-red-600 font-semibold"
        >
          🏠
        </Link>
        <Link
          href="/items"
          className="flex-1 text-center py-4 text-gray-600 hover:text-red-600"
        >
          📋
        </Link>
        <Link
          href="/login"
          className="flex-1 text-center py-4 text-gray-600 hover:text-red-600"
        >
          👤
        </Link>
      </div>
    </nav>
  );
}
