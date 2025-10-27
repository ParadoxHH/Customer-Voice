export const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat('en-US', options).format(value);

export const formatPercent = (value: number) =>
  `${(value * 100).toFixed(1)}%`;

export const formatDateShort = (value: string | Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    typeof value === 'string' ? new Date(value) : value
  );

export const sentimentColor = (label: string) => {
  switch (label) {
    case 'Positive':
      return 'text-emerald';
    case 'Negative':
      return 'text-ruby';
    default:
      return 'text-white/70';
  }
};

export const sentimentBadgeBg = (label: string) => {
  switch (label) {
    case 'Positive':
      return 'bg-emerald/20 text-emerald';
    case 'Negative':
      return 'bg-ruby/20 text-ruby';
    default:
      return 'bg-white/10 text-white/70';
  }
};
