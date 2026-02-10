import { AlertCircle } from 'lucide-react';

interface AlertCardProps {
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  actionText: string;
  onAction: () => void;
}

const typeStyles = {
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-600',
    icon: 'text-yellow-600',
    text: { title: 'text-yellow-900', message: 'text-yellow-800' },
    button: 'bg-yellow-600 hover:bg-yellow-700',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-600',
    icon: 'text-red-600',
    text: { title: 'text-red-900', message: 'text-red-800' },
    button: 'bg-red-600 hover:bg-red-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-600',
    icon: 'text-blue-600',
    text: { title: 'text-blue-900', message: 'text-blue-800' },
    button: 'bg-blue-600 hover:bg-blue-700',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-600',
    icon: 'text-green-600',
    text: { title: 'text-green-900', message: 'text-green-800' },
    button: 'bg-green-600 hover:bg-green-700',
  },
};

export default function AlertCard({
  type,
  title,
  message,
  actionText,
  onAction,
}: AlertCardProps) {
  const styles = typeStyles[type];

  return (
    <div
      className={`${styles.bg} border-l-4 ${styles.border} rounded-lg p-4 md:p-6 flex flex-col md:flex-row md:items-start gap-3 md:gap-4`}
    >
      <div className="flex items-start gap-3 md:gap-4 flex-1">
        <AlertCircle
          size={20}
          className={`${styles.icon} flex-shrink-0 mt-0.5 md:mt-1 md:w-6 md:h-6`}
        />
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm md:text-base ${styles.text.title}`}>
            {title}
          </h3>
          <p
            className={`text-sm md:text-base ${styles.text.message} break-words`}
          >
            {message}
          </p>
        </div>
      </div>
      <button
        onClick={onAction}
        className={`w-full md:w-auto px-4 py-2 ${styles.button} text-white rounded-lg font-semibold transition text-sm md:text-base flex-shrink-0`}
      >
        {actionText}
      </button>
    </div>
  );
}
