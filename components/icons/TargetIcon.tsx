export default function TargetIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="animate-pulse-slow" style={{ animationDelay: '0.4s' }}>
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          className="text-neon-cyan"
        />
        <circle
          cx="12"
          cy="12"
          r="6"
          stroke="currentColor"
          strokeWidth="2"
          className="text-neon-cyan"
        />
        <circle
          cx="12"
          cy="12"
          r="2"
          fill="currentColor"
          className="text-neon-green animate-ping"
          style={{ animationDuration: '2s' }}
        />
      </g>
    </svg>
  );
}
