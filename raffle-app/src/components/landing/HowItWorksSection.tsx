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
      description: 'Deposit money or complete tasks to earn free raffle points.',
    },
    {
      number: 3,
      title: 'Buy Tickets',
      description: 'Pick your favourite item and buy one ticket per raffle draw.',
    },
    {
      number: 4,
      title: 'Win & Receive',
      description: "Win and we'll contact you. Your prize gets delivered straight to your door.",
    },
  ];

  return (
    <section id="how" className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            How It Works
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Four simple steps to start winning
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="text-center bg-white p-6 rounded-xl border border-gray-200 hover:border-red-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-lg font-semibold text-sm mb-4">
                {step.number}
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5">
                {step.title}
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
