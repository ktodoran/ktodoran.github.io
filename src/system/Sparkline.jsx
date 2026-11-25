// A small trend line. `floor` and `ceiling` keep a flat, healthy series from
// being stretched to fill the box and looking alarming.
export default function Sparkline({ values, floor, ceiling, width = 140, height = 22 }) {
  if (values.length < 2) return <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} aria-hidden="true" />;

  const low = Math.min(floor, ...values);
  const high = Math.max(ceiling, ...values);
  const span = high - low || 1;
  const points = values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - 1 - ((value - low) / span) * (height - 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} />
    </svg>
  );
}
