import { Shield, Zap, TrendingUp } from 'lucide-react';

const features = [
    {
        icon: Shield,
        title: '100% Secure & Fair',
        description: 'All raffles are transparent and provably fair. Your money is safe with us.',
        color: 'red',
        bgFrom: 'from-red-50',
        borderColor: 'border-red-100',
        iconBg: 'bg-red-600',
    },
    {
        icon: Zap,
        title: 'Earn Raffle Points',
        description: 'Complete tasks and watch ads to earn free raffle points. No spending needed.',
        color: 'amber',
        bgFrom: 'from-amber-50',
        borderColor: 'border-amber-100',
        iconBg: 'bg-amber-500',
    },
    {
        icon: TrendingUp,
        title: 'Best Odds',
        description: 'Win amazing prizes with the best odds in the market. More chances, bigger prizes.',
        color: 'emerald',
        bgFrom: 'from-emerald-50',
        borderColor: 'border-emerald-100',
        iconBg: 'bg-emerald-600',
    },
];

export default function FeaturesSection() {
    return (
        <section className="py-14 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                        Why Choose RaffleHub?
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        Trusted by thousands of users nationwide
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className={`bg-gradient-to-br ${f.bgFrom} to-white p-7 rounded-2xl border ${f.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
                        >
                            <div className={`w-12 h-12 ${f.iconBg} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                                <f.icon size={22} className="text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
