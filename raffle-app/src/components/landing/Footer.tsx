import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 mt-12">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={200}
                height={80}
                className="h-auto w-40 md:h-auto md:w-48 object-contain"
              />
            </Link>
          </div>
          <p className="text-gray-400 text-sm">Win big, play fair.</p>
        </div>

        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>
              <a href="#items" className="hover:text-red-500 transition">
                Items
              </a>
            </li>
            <li>
              <a href="#winners" className="hover:text-red-500 transition">
                Winners
              </a>
            </li>
            <li>
              <a href="#how" className="hover:text-red-500 transition">
                How It Works
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>
              <Link href="#" className="hover:text-red-500 transition">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-red-500 transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-red-500 transition">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4">Follow Us</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>
              <Link href="#" className="hover:text-red-500 transition">
                Twitter
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-red-500 transition">
                Instagram
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-red-500 transition">
                Facebook
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
        <p>&copy; 2026 RaffleHub. All rights reserved.</p>
      </div>
    </footer>
  );
}
