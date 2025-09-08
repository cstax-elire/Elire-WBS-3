export default function StatusBadge({ status }) {
  const styles = {
    aligned: 'bg-green-100 text-green-800',
    misattributed: 'bg-red-100 text-red-800',
    not_observed: 'bg-yellow-100 text-yellow-800'
  };

  const labels = {
    aligned: 'Aligned',
    misattributed: 'Misattributed',
    not_observed: 'Not Observed'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || styles.not_observed}`}>
      {labels[status] || 'Unknown'}
    </span>
  );
}