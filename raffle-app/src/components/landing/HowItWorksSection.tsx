export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description:
        'Sign up in seconds with your email and get instant access to all active raffle draws.',
    },
    {
      number: '02',
      title: 'Complete Tasks & Earn',
      description:
        'Finish daily tasks to earn real cash credited directly into your raffle wallet.',
    },
    {
      number: '03',
      title: 'Buy Tickets',
      description: 'Use your wallet balance to purchase tickets for any item you want to win.',
    },
    {
      number: '04',
      title: 'Win & Receive',
      description:
        'When tickets sell out the draw happens immediately — winners get their prize delivered.',
    },
  ];

  return (
    <section id="how" className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-bold text-[#E10600] uppercase tracking-widest mb-2">
            Simple process
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            How it works
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line (all but last) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[calc(50%+20px)] right-0 h-px bg-gray-200 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-10 h-10 bg-[#E10600] text-white rounded-xl flex items-center justify-center font-black text-sm mb-4 shadow-sm">
                  {step.number}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
