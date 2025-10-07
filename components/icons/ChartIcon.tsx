export default function ChartIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="animate-pulse-slow" style={{ animationDelay: '0.2s' }}>
        <path
          d="M3 3V21H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neon-green"
        />
        <path
          d="M7 16L12 11L16 15L21 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neon-cyan"
        />
        <path
          d="M21 10V14M21 10H17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neon-cyan"
        />
      </g>
    </svg>
  );
}
