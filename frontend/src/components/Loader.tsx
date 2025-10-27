interface LoaderProps {
  label?: string;
}

export function Loader({ label = 'Loading...' }: LoaderProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-10" role="status" aria-live="polite">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-emerald" />
      <p className="text-sm text-white/70">{label}</p>
    </div>
  );
}

export default Loader;
