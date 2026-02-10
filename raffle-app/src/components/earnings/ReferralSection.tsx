export default function ReferralSection() {
  return (
    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 md:p-12">
      <div className="max-w-2xl">
        <h3 className="font-bold text-2xl mb-3">
          Refer Friends & Get Rewarded
        </h3>
        <p className="text-white/90 mb-6">
          Share your unique referral link with friends. When they sign up, you
          both get bonus raffle points! There&apos;s no limit to how many
          friends you can invite.
        </p>

        <div className="bg-white/10 border border-white/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-white/70 mb-2">Your Referral Link:</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value="https://rafflehub.ng/ref/USER-98765"
              readOnly
              className="flex-1 w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 text-sm overflow-ellipsis min-w-0"
            />
            <button className="w-full sm:w-auto px-6 py-2 bg-white text-purple-600 rounded-lg font-bold hover:bg-white/90 transition text-sm">
              Copy
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-white/70 mb-2">You Get</p>
            <p className="text-2xl font-bold">500 points</p>
            <p className="text-xs text-white/70">When friend signs up</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-white/70 mb-2">Your Friend Gets</p>
            <p className="text-2xl font-bold">100 points</p>
            <p className="text-xs text-white/70">Bonus welcome gift</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <button className="w-full py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-white/90 transition">
            Share Referral Link
          </button>
          <p className="text-center text-sm text-white/70">
            You&apos;ve invited <span className="font-bold">3 friends</span>
          </p>
        </div>
      </div>
    </div>
  );
}
