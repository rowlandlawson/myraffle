interface WelcomeBannerProps {
  userName: string;
  userNumber: string;
}

export default function WelcomeBanner({
  userName,
  userNumber,
}: WelcomeBannerProps) {
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white">
      <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
      <p className="text-red-100">
        Your unique account number:{' '}
        <span className="font-bold">{userNumber}</span>
      </p>
    </div>
  );
}
