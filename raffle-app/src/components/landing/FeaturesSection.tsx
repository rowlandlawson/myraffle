import { Shield, Zap, TrendingUp } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          Why Choose RaffleHub?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-red-50 to-white p-8 rounded-xl border border-red-100">
            <div className="w-14 h-14 bg-red-600 rounded-lg flex items-center justify-center mb-4">
              <Shield size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              100% Secure & Fair
            </h3>
            <p className="text-gray-600">
              All raffles are transparent and provably fair. Your money is safe
              with us.
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-white p-8 rounded-xl border border-yellow-100">
            <div className="w-14 h-14 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
              <Zap size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Earn Raffle Points
            </h3>
            <p className="text-gray-600">
              Complete tasks and watch ads to earn free raffle points. No
              spending needed.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl border border-green-100">
            <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Best Odds</h3>
            <p className="text-gray-600">
              Win amazing prizes with the best odds in the market. More chances,
              bigger prizes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
