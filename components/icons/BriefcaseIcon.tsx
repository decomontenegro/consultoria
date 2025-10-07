export default function BriefcaseIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="animate-pulse-slow" style={{ animationDelay: '0.6s' }}>
        <rect
          x="3"
          y="7"
          width="18"
          height="13"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neon-purple"
        />
        <path
          d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neon-purple"
        />
        <path
          d="M3 13H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neon-purple"
        />
        <circle
          cx="12"
          cy="13"
          r="1.5"
          fill="currentColor"
          className="text-neon-green"
        />
      </g>
    </svg>
  );
}
