interface LoadingProps {
  label?: string;
}

export function Loading({ label = 'Loading...' }: LoadingProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      role="status"
      aria-live="polite"
    >
      <span
        style={{
          width: '1.5rem',
          height: '1.5rem',
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.9s linear infinite'
        }}
      />
      <span style={{ fontWeight: 600, color: '#475569' }}>{label}</span>
      <style>
        {`@keyframes spin { 
            from { transform: rotate(0deg); } 
            to { transform: rotate(360deg); } 
          }`}
      </style>
    </div>
  );
}

export default Loading;
