export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: 'Create Account',
      description: 'Sign up in seconds with your email. Get a unique user ID.',
    },
    {
      number: 2,
      title: 'Add Funds or Earn',
      description:
        'Deposit money or complete tasks to earn free raffle points.',
    },
    {
      number: 3,
      title: 'Buy Tickets',
      description: 'Pick your favorite item and buy one ticket per item.',
    },
    {
      number: 4,
      title: 'Win & Withdraw',
      description: "Win and we'll contact you. Withdraw your winnings anytime.",
    },
  ];

  return (
    <section id="how" className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-full font-bold text-2xl mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
