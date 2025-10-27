interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      style={{
        borderRadius: '0.75rem',
        padding: '0.85rem 1rem',
        backgroundColor: 'rgba(220, 38, 38, 0.08)',
        border: '1px solid rgba(220, 38, 38, 0.25)',
        color: '#991b1b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}
    >
      <span style={{ fontWeight: 600 }}>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="secondary"
          style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorBanner;
