interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="glass flex items-center justify-between gap-4 border border-ruby/30 bg-ruby/10 px-4 py-3 text-sm text-white"
    >
      <span className="font-medium">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-secondary rounded-full bg-white/10 px-3 py-1 text-xs"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorBanner;
