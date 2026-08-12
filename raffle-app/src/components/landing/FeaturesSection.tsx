import { Shield, Zap, TrendingUp } from 'lucide-react';

const features = [
    {
        icon: Shield,
        title: '100% Secure & Fair',
        description: 'All raffles are provably fair, transparent, and regulated. Every draw is fully auditable.',
        iconBg: 'bg-[#C0000C]',
        accent: 'border-l-[#C0000C]',
    },
    {
        icon: Zap,
        title: 'Earn Cash via Tasks',
        description: 'Complete simple daily tasks to earn cash rewards credited straight to your wallet.',
        iconBg: 'bg-amber-500',
        accent: 'border-l-amber-500',
    },
    {
        icon: TrendingUp,
        title: 'Best Winning Odds',
        description: 'Win high-value luxury prizes with guaranteed limited entries. Better odds than the lottery.',
        iconBg: 'bg-emerald-600',
        accent: 'border-l-emerald-600',
    },
];

export default function FeaturesSection() {
    return (
        <section className="py-16 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <p className="text-xs font-bold text-[#C0000C] uppercase tracking-widest mb-2">Why myRaffle</p>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                        Built for winners.
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className={`bg-white p-6 rounded-2xl border border-gray-100 border-l-4 ${f.accent} hover:shadow-md transition-all duration-200`}
                        >
                            <div className={`w-10 h-10 ${f.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                                <f.icon size={18} className="text-white" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
