interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'Nothing to show yet',
  description = 'Try adjusting your filters or ingesting fresh data.',
  action
}: EmptyStateProps) {
  return (
    <div
      style={{
        padding: '1.5rem',
        textAlign: 'center',
        color: '#64748b'
      }}
    >
      <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem', color: '#1f2937' }}>{title}</h3>
      <p style={{ margin: '0', fontSize: '0.9rem' }}>{description}</p>
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}

export default EmptyState;
